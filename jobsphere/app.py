from flask import Flask, render_template, redirect, url_for, flash, request, jsonify, send_from_directory, abort
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from flask_wtf.csrf import CSRFProtect
from werkzeug.utils import secure_filename
from datetime import datetime
import os
import uuid

from config import Config
from models import db, User, SeekerProfile, EmployerProfile, Job, Application, SavedJob, Notification
from forms import RegistrationForm, LoginForm, JobPostForm, ApplicationForm, SeekerProfileForm, EmployerProfileForm, SearchForm
from decorators import seeker_required, employer_required
from utils import calculate_profile_completeness, search_jobs, create_notification, get_unread_notifications_count, calculate_skill_match

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CSRFProtect(app)

    # Custom Jinja2 filters
    @app.template_filter('number_format')
    def number_format(value):
        """Format numbers with commas for thousands"""
        if value is None:
            return ""
        try:
            return "{:,}".format(int(value))
        except (ValueError, TypeError):
            return str(value)

    login_manager = LoginManager()
    login_manager.init_app(app)
    login_manager.login_view = 'login'
    login_manager.login_message = 'Please log in to access this page.'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # Context processor for notifications
    @app.context_processor
    def inject_notifications():
        if current_user.is_authenticated:
            return {'unread_notifications': get_unread_notifications_count(current_user.id)}
        return {'unread_notifications': 0}

    # Routes

    @app.route('/')
    def index():
        featured_jobs = Job.query.filter_by(status='active').order_by(Job.posted_at.desc()).limit(6).all()
        return render_template('index.html', featured_jobs=featured_jobs)

    @app.route('/register', methods=['GET', 'POST'])
    def register():
        form = RegistrationForm()
        if form.validate_on_submit():
            try:
                user = User(
                    name=form.name.data,
                    email=form.email.data.lower(),  # Store email in lowercase for consistency
                    role=form.role.data
                )
                user.set_password(form.password.data)
                db.session.add(user)
                db.session.commit()

                if user.role == 'seeker':
                    profile = SeekerProfile(user_id=user.id)
                    db.session.add(profile)
                else:
                    profile = EmployerProfile(
                        user_id=user.id,
                        company_name=form.company_name.data or ''
                    )
                    db.session.add(profile)
                db.session.commit()

                flash('Registration successful! Please log in.', 'success')
                return redirect(url_for('login'))
            except Exception as e:
                db.session.rollback()
                app.logger.error(f'Registration error: {str(e)}')
                if 'UNIQUE constraint failed' in str(e):
                    flash('This email address is already registered. Please use a different email or try logging in.', 'danger')
                else:
                    flash('An error occurred during registration. Please try again.', 'danger')
                return render_template('auth/register.html', form=form)
        return render_template('auth/register.html', form=form)

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for('dashboard'))
        form = LoginForm()
        if form.validate_on_submit():
            user = User.query.filter_by(email=form.email.data).first()
            if user and user.check_password(form.password.data):
                login_user(user, remember=form.remember.data)
                user.last_login = datetime.utcnow()
                db.session.commit()
                next_page = request.args.get('next')
                return redirect(next_page) if next_page else redirect(url_for('dashboard'))
            flash('Invalid email or password.', 'danger')
        return render_template('auth/login.html', form=form)

    @app.route('/logout')
    @login_required
    def logout():
        logout_user()
        flash('You have been logged out.', 'info')
        return redirect(url_for('index'))

    @app.route('/dashboard')
    @login_required
    def dashboard():
        if current_user.role == 'seeker':
            return redirect(url_for('seeker_dashboard'))
        else:
            return redirect(url_for('employer_dashboard'))

    @app.route('/dashboard/seeker')
    @seeker_required
    def seeker_dashboard():
        applications = Application.query.filter_by(seeker_id=current_user.id).order_by(Application.applied_at.desc()).all()
        saved_jobs = SavedJob.query.filter_by(user_id=current_user.id).all()
        profile = current_user.seeker_profile
        completeness = calculate_profile_completeness(profile) if profile else 0
        return render_template('dashboard/seeker.html', applications=applications, saved_jobs=saved_jobs, completeness=completeness)

    @app.route('/dashboard/employer')
    @employer_required
    def employer_dashboard():
        jobs = Job.query.filter_by(employer_id=current_user.id).all()
        applications = Application.query.join(Job).filter(Job.employer_id == current_user.id).all()
        return render_template('dashboard/employer.html', jobs=jobs, applications=applications)

    @app.route('/jobs')
    def jobs():
        form = SearchForm(request.args)
        page = request.args.get('page', 1, type=int)
        jobs_pagination = search_jobs(
            query=form.q.data,
            location=form.location.data,
            job_type=form.job_type.data,
            salary_min=form.salary_min.data,
            salary_max=form.salary_max.data,
            experience_level=form.experience_level.data,
            page=page
        )
        return render_template('jobs/list.html', form=form, jobs=jobs_pagination)

    @app.route('/jobs/<int:job_id>')
    def job_detail(job_id):
        job = Job.query.get_or_404(job_id)
        job.views_count += 1
        db.session.commit()

        skill_match = 0
        if current_user.is_authenticated and current_user.role == 'seeker' and current_user.seeker_profile:
            skill_match = calculate_skill_match(current_user.seeker_profile.skills, job.skills_required)

        return render_template('jobs/detail.html', job=job, skill_match=skill_match)

    @app.route('/jobs/<int:job_id>/apply', methods=['GET', 'POST'])
    @seeker_required
    def apply_job(job_id):
        job = Job.query.get_or_404(job_id)
        existing = Application.query.filter_by(job_id=job_id, seeker_id=current_user.id).first()
        if existing:
            flash('You have already applied for this job.', 'warning')
            return redirect(url_for('job_detail', job_id=job_id))

        form = ApplicationForm()
        if form.validate_on_submit():
            try:
                filename = None
                if form.resume.data:
                    filename = str(uuid.uuid4()) + '.pdf'
                    form.resume.data.save(os.path.join(app.config['UPLOAD_FOLDER'], 'resumes', filename))

                application = Application(
                    job_id=job_id,
                    seeker_id=current_user.id,
                    cover_letter=form.cover_letter.data,
                    resume_url=filename
                )
                db.session.add(application)
                db.session.commit()

                create_notification(
                    job.employer_id,
                    f'New application for "{job.title}" from {current_user.name}',
                    'application',
                    url_for('employer_applications', job_id=job_id)
                )

                flash('Application submitted successfully!', 'success')
                return redirect(url_for('seeker_applications'))
            except Exception as e:
                db.session.rollback()
                app.logger.error(f'Application submission error: {str(e)}')
                flash('An error occurred while submitting your application. Please try again.', 'danger')
        return render_template('jobs/apply.html', job=job, form=form)

    @app.route('/jobs/<int:job_id>/save', methods=['POST'])
    @seeker_required
    def save_job(job_id):
        saved = SavedJob.query.filter_by(user_id=current_user.id, job_id=job_id).first()
        if saved:
            db.session.delete(saved)
            db.session.commit()
            return jsonify({'saved': False})
        else:
            saved = SavedJob(user_id=current_user.id, job_id=job_id)
            db.session.add(saved)
            db.session.commit()
            return jsonify({'saved': True})

    @app.route('/seeker/applications')
    @seeker_required
    def seeker_applications():
        applications = Application.query.filter_by(seeker_id=current_user.id).order_by(Application.applied_at.desc()).all()
        return render_template('seeker/applications.html', applications=applications)

    @app.route('/seeker/saved')
    @seeker_required
    def seeker_saved():
        saved_jobs = SavedJob.query.filter_by(user_id=current_user.id).all()
        return render_template('seeker/saved.html', saved_jobs=saved_jobs)

    @app.route('/seeker/profile')
    @seeker_required
    def seeker_profile():
        return render_template('profile/seeker_view.html')

    @app.route('/seeker/profile/edit', methods=['GET', 'POST'])
    @seeker_required
    def seeker_profile_edit():
        profile = current_user.seeker_profile
        form = SeekerProfileForm(obj=profile)
        if form.validate_on_submit():
            try:
                form.populate_obj(profile)
                if form.avatar.data:
                    filename = str(uuid.uuid4()) + os.path.splitext(secure_filename(form.avatar.data.filename))[1]
                    form.avatar.data.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                    profile.user.avatar_url = filename
                if form.resume.data:
                    filename = str(uuid.uuid4()) + '.pdf'
                    form.resume.data.save(os.path.join(app.config['UPLOAD_FOLDER'], 'resumes', filename))
                    profile.resume_url = filename
                profile.profile_complete_pct = calculate_profile_completeness(profile)
                db.session.commit()
                flash('Profile updated successfully!', 'success')
                return redirect(url_for('seeker_profile'))
            except Exception as e:
                db.session.rollback()
                app.logger.error(f'Profile update error: {str(e)}')
                flash('An error occurred while updating your profile. Please try again.', 'danger')
        return render_template('profile/seeker_edit.html', form=form)

    @app.route('/employer/post-job', methods=['GET', 'POST'])
    @employer_required
    def post_job():
        form = JobPostForm()
        if form.validate_on_submit():
            try:
                job = Job(
                    employer_id=current_user.id,
                    title=form.title.data,
                    company=form.company.data,
                    location=form.location.data,
                    job_type=form.job_type.data,
                    salary_min=form.salary_min.data,
                    salary_max=form.salary_max.data,
                    salary_currency=form.salary_currency.data,
                    description=form.description.data,
                    requirements=form.requirements.data,
                    skills_required=form.skills_required.data,
                    experience_level=form.experience_level.data,
                    deadline=form.deadline.data
                )
                db.session.add(job)
                db.session.commit()
                flash('Job posted successfully!', 'success')
                return redirect(url_for('employer_jobs'))
            except Exception as e:
                db.session.rollback()
                app.logger.error(f'Job posting error: {str(e)}')
                flash('An error occurred while posting the job. Please try again.', 'danger')
        return render_template('employer/post_job.html', form=form)

    @app.route('/employer/jobs')
    @employer_required
    def employer_jobs():
        jobs = Job.query.filter_by(employer_id=current_user.id).all()
        return render_template('employer/jobs.html', jobs=jobs)

    @app.route('/employer/jobs/<int:job_id>/edit', methods=['GET', 'POST'])
    @employer_required
    def edit_job(job_id):
        job = Job.query.get_or_404(job_id)
        if job.employer_id != current_user.id:
            abort(403)
        form = JobPostForm(obj=job)
        if form.validate_on_submit():
            form.populate_obj(job)
            job.updated_at = datetime.utcnow()
            db.session.commit()
            flash('Job updated successfully!', 'success')
            return redirect(url_for('employer_jobs'))
        return render_template('employer/edit_job.html', form=form, job=job)

    @app.route('/employer/jobs/<int:job_id>/delete', methods=['POST'])
    @employer_required
    def delete_job(job_id):
        job = Job.query.get_or_404(job_id)
        if job.employer_id != current_user.id:
            abort(403)
        job.status = 'closed'
        db.session.commit()
        flash('Job closed successfully.', 'success')
        return redirect(url_for('employer_jobs'))

    @app.route('/employer/jobs/<int:job_id>/applications')
    @employer_required
    def employer_applications(job_id):
        job = Job.query.get_or_404(job_id)
        if job.employer_id != current_user.id:
            abort(403)
        applications = Application.query.filter_by(job_id=job_id).all()
        return render_template('employer/applications.html', job=job, applications=applications)

    @app.route('/employer/application/<int:app_id>/status', methods=['POST'])
    @employer_required
    def update_application_status(app_id):
        application = Application.query.get_or_404(app_id)
        if application.job.employer_id != current_user.id:
            abort(403)
        new_status = request.form.get('status')
        if new_status in ['applied', 'viewed', 'shortlisted', 'rejected', 'hired']:
            application.status = new_status
            application.updated_at = datetime.utcnow()
            db.session.commit()
            create_notification(
                application.seeker_id,
                f'Your application for "{application.job.title}" has been {new_status}.',
                'status',
                url_for('seeker_applications')
            )
            flash(f'Application status updated to {new_status}.', 'success')
        return redirect(url_for('employer_applications', job_id=application.job_id))

    @app.route('/employer/profile')
    @employer_required
    def employer_profile():
        return render_template('profile/employer_view.html')

    @app.route('/employer/profile/edit', methods=['GET', 'POST'])
    @employer_required
    def employer_profile_edit():
        profile = current_user.employer_profile
        form = EmployerProfileForm(obj=profile)
        if form.validate_on_submit():
            try:
                form.populate_obj(profile)
                if form.logo.data:
                    filename = str(uuid.uuid4()) + os.path.splitext(secure_filename(form.logo.data.filename))[1]
                    form.logo.data.save(os.path.join(app.config['UPLOAD_FOLDER'], 'logos', filename))
                    profile.logo_url = filename
                db.session.commit()
                flash('Profile updated successfully!', 'success')
                return redirect(url_for('employer_profile'))
            except Exception as e:
                db.session.rollback()
                app.logger.error(f'Employer profile update error: {str(e)}')
                flash('An error occurred while updating your profile. Please try again.', 'danger')
        return render_template('profile/employer_edit.html', form=form)

    @app.route('/search')
    def search():
        return redirect(url_for('jobs', **request.args))

    @app.route('/profile/<int:user_id>')
    def public_profile(user_id):
        user = User.query.get_or_404(user_id)
        if user.role == 'seeker':
            return render_template('profile/seeker_view.html', user=user, public=True)
        else:
            return render_template('profile/employer_view.html', user=user, public=True)

    @app.route('/company/<int:employer_id>')
    def company_profile(employer_id):
        user = User.query.get_or_404(employer_id)
        if user.role != 'employer':
            abort(404)
        return render_template('profile/company_view.html', user=user)

    @app.route('/notifications')
    @login_required
    def notifications():
        notifications = Notification.query.filter_by(user_id=current_user.id).order_by(Notification.created_at.desc()).all()
        Notification.query.filter_by(user_id=current_user.id, is_read=False).update({'is_read': True})
        db.session.commit()
        return render_template('notifications.html', notifications=notifications)

    @app.route('/notifications/mark-read', methods=['POST'])
    @login_required
    def mark_notifications_read():
        Notification.query.filter_by(user_id=current_user.id, is_read=False).update({'is_read': True})
        db.session.commit()
        return jsonify({'success': True})

    @app.route('/api/jobs/suggestions')
    def job_suggestions():
        q = request.args.get('q', '')
        if len(q) < 2:
            return jsonify([])
        jobs = Job.query.filter(
            db.and_(
                Job.status == 'active',
                db.or_(
                    Job.title.ilike(f'%{q}%'),
                    Job.company.ilike(f'%{q}%')
                )
            )
        ).limit(5).all()
        suggestions = [{'title': job.title, 'company': job.company, 'url': url_for('job_detail', job_id=job.id)} for job in jobs]
        return jsonify(suggestions)

    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return render_template('errors/404.html'), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return render_template('errors/500.html'), 500

    return app

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        app.logger.error(f'Internal server error: {str(error)}')
        flash('An unexpected error occurred. Please try again.', 'danger')
        return redirect(url_for('index'))

    @app.errorhandler(404)
    def not_found_error(error):
        return render_template('errors/404.html'), 404

    @app.errorhandler(403)
    def forbidden_error(error):
        flash('You do not have permission to access this page.', 'danger')
        return redirect(url_for('index'))

if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        db.create_all()
    app.run(debug=True)