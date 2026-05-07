import json
from models import db, Notification

def calculate_profile_completeness(seeker_profile):
    """Calculate profile completeness percentage."""
    fields = [
        seeker_profile.bio,
        seeker_profile.skills,
        seeker_profile.experience,
        seeker_profile.education,
        seeker_profile.resume_url,
        seeker_profile.location,
        seeker_profile.job_type_pref
    ]
    completed = sum(1 for field in fields if field and str(field).strip())
    return int((completed / len(fields)) * 100)

def search_jobs(query, location, job_type, salary_min, salary_max, experience_level, page=1, per_page=10):
    """Search and filter jobs."""
    from models import Job
    jobs_query = Job.query.filter_by(status='active')

    if query:
        jobs_query = jobs_query.filter(
            db.or_(
                Job.title.ilike(f'%{query}%'),
                Job.description.ilike(f'%{query}%'),
                Job.company.ilike(f'%{query}%'),
                Job.skills_required.ilike(f'%{query}%')
            )
        )

    if location:
        jobs_query = jobs_query.filter(Job.location.ilike(f'%{location}%'))

    if job_type:
        jobs_query = jobs_query.filter_by(job_type=job_type)

    if salary_min:
        jobs_query = jobs_query.filter(Job.salary_max >= salary_min)

    if salary_max:
        jobs_query = jobs_query.filter(Job.salary_min <= salary_max)

    if experience_level:
        jobs_query = jobs_query.filter_by(experience_level=experience_level)

    jobs_query = jobs_query.order_by(Job.posted_at.desc())
    return jobs_query.paginate(page=page, per_page=per_page, error_out=False)

def create_notification(user_id, message, type, link=None):
    """Create a notification for a user."""
    notification = Notification(
        user_id=user_id,
        message=message,
        type=type,
        link=link
    )
    db.session.add(notification)
    db.session.commit()

def get_unread_notifications_count(user_id):
    """Get count of unread notifications for a user."""
    return Notification.query.filter_by(user_id=user_id, is_read=False).count()

def calculate_skill_match(seeker_skills, job_skills):
    """Calculate skill match percentage."""
    if not seeker_skills or not job_skills:
        return 0

    seeker_set = set(skill.strip().lower() for skill in seeker_skills.split(',') if skill.strip())
    job_set = set(skill.strip().lower() for skill in job_skills.split(',') if skill.strip())

    if not job_set:
        return 0

    matches = len(seeker_set.intersection(job_set))
    return int((matches / len(job_set)) * 100)