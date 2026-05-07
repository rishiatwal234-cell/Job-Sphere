from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, TextAreaField, SelectField, IntegerField, DateField, BooleanField, FileField, HiddenField
from wtforms.validators import DataRequired, Email, Length, EqualTo, Optional, NumberRange, ValidationError
from flask_wtf.file import FileAllowed
from models import User

def validate_unique_email(form, field):
    """Check if email is already registered"""
    user = User.query.filter_by(email=field.data.lower()).first()
    if user:
        raise ValidationError('This email address is already registered. Please use a different email or try logging in.')

class RegistrationForm(FlaskForm):
    name = StringField('Full Name', validators=[DataRequired(), Length(min=2, max=100)])
    email = StringField('Email', validators=[DataRequired(), Email(), validate_unique_email])
    password = PasswordField('Password', validators=[DataRequired(), Length(min=6)])
    confirm_password = PasswordField('Confirm Password', validators=[DataRequired(), EqualTo('password')])
    role = SelectField('I am a', choices=[('seeker', 'Job Seeker'), ('employer', 'Employer')], validators=[DataRequired()])
    company_name = StringField('Company Name', validators=[Optional(), Length(max=150)])

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[DataRequired(), Email()])
    password = PasswordField('Password', validators=[DataRequired()])
    remember = BooleanField('Remember me')

class JobPostForm(FlaskForm):
    title = StringField('Job Title', validators=[DataRequired(), Length(max=150)])
    company = StringField('Company Name', validators=[DataRequired(), Length(max=150)])
    location = StringField('Location', validators=[Optional(), Length(max=100)])
    job_type = SelectField('Job Type', choices=[
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('remote', 'Remote'),
        ('freelance', 'Freelance'),
        ('internship', 'Internship')
    ], validators=[DataRequired()])
    salary_min = IntegerField('Minimum Salary', validators=[Optional(), NumberRange(min=0)])
    salary_max = IntegerField('Maximum Salary', validators=[Optional(), NumberRange(min=0)])
    salary_currency = StringField('Currency', default='INR', validators=[Length(max=10)])
    description = TextAreaField('Job Description', validators=[DataRequired()])
    requirements = TextAreaField('Requirements', validators=[Optional()])
    skills_required = StringField('Required Skills (comma-separated)', validators=[Optional()])
    experience_level = SelectField('Experience Level', choices=[
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
        ('lead', 'Lead/Executive')
    ], validators=[DataRequired()])
    deadline = DateField('Application Deadline', validators=[Optional()])

class ApplicationForm(FlaskForm):
    cover_letter = TextAreaField('Cover Letter', validators=[Optional()])
    resume = FileField('Resume (PDF)', validators=[FileAllowed(['pdf'], 'PDF files only!')])

class SeekerProfileForm(FlaskForm):
    bio = TextAreaField('Bio', validators=[Optional()])
    skills = StringField('Skills (comma-separated)', validators=[Optional()])
    experience = HiddenField('Experience (JSON)', validators=[Optional()])
    education = HiddenField('Education (JSON)', validators=[Optional()])
    linkedin_url = StringField('LinkedIn URL', validators=[Optional(), Length(max=255)])
    portfolio_url = StringField('Portfolio URL', validators=[Optional(), Length(max=255)])
    location = StringField('Location', validators=[Optional(), Length(max=100)])
    job_type_pref = SelectField('Preferred Job Type', choices=[
        ('', 'Any'),
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('remote', 'Remote'),
        ('freelance', 'Freelance'),
        ('internship', 'Internship')
    ], validators=[Optional()])
    avatar = FileField('Profile Picture', validators=[FileAllowed(['jpg', 'jpeg', 'png', 'gif'], 'Images only!')])
    resume = FileField('Resume (PDF)', validators=[FileAllowed(['pdf'], 'PDF files only!')])

class EmployerProfileForm(FlaskForm):
    company_name = StringField('Company Name', validators=[DataRequired(), Length(max=150)])
    industry = StringField('Industry', validators=[Optional(), Length(max=100)])
    company_size = SelectField('Company Size', choices=[
        ('startup', 'Startup (1-10 employees)'),
        ('small', 'Small (11-50 employees)'),
        ('medium', 'Medium (51-200 employees)'),
        ('large', 'Large (200+ employees)')
    ], validators=[Optional()])
    website = StringField('Website', validators=[Optional(), Length(max=255)])
    description = TextAreaField('Company Description', validators=[Optional()])
    location = StringField('Location', validators=[Optional(), Length(max=100)])
    logo = FileField('Company Logo', validators=[FileAllowed(['jpg', 'jpeg', 'png', 'gif'], 'Images only!')])
    is_featured = BooleanField('Featured Company')

class SearchForm(FlaskForm):
    q = StringField('Search', validators=[Optional()])
    location = StringField('Location', validators=[Optional()])
    job_type = SelectField('Job Type', choices=[
        ('', 'Any'),
        ('full-time', 'Full-time'),
        ('part-time', 'Part-time'),
        ('remote', 'Remote'),
        ('freelance', 'Freelance'),
        ('internship', 'Internship')
    ], validators=[Optional()])
    salary_min = IntegerField('Min Salary', validators=[Optional(), NumberRange(min=0)])
    salary_max = IntegerField('Max Salary', validators=[Optional(), NumberRange(min=0)])
    experience_level = SelectField('Experience Level', choices=[
        ('', 'Any'),
        ('entry', 'Entry Level'),
        ('mid', 'Mid Level'),
        ('senior', 'Senior Level'),
        ('lead', 'Lead/Executive')
    ], validators=[Optional()])