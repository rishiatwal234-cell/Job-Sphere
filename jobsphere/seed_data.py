from app import create_app
from models import db, User, SeekerProfile, EmployerProfile, Job, Application
from datetime import datetime, date

def seed_data():
    app = create_app()
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()

        # Create employers
        employer1 = User(name='John Smith', email='john@techcorp.com', role='employer')
        employer1.set_password('password')
        db.session.add(employer1)

        employer2 = User(name='Sarah Johnson', email='sarah@innovate.com', role='employer')
        employer2.set_password('password')
        db.session.add(employer2)

        db.session.commit()

        # Create employer profiles
        emp_profile1 = EmployerProfile(
            user_id=employer1.id,
            company_name='TechCorp',
            industry='Technology',
            company_size='medium',
            website='https://techcorp.com',
            description='Leading tech company focused on innovation.',
            location='San Francisco, CA'
        )
        db.session.add(emp_profile1)

        emp_profile2 = EmployerProfile(
            user_id=employer2.id,
            company_name='Innovate Solutions',
            industry='Consulting',
            company_size='small',
            website='https://innovate.com',
            description='Creative solutions for modern businesses.',
            location='New York, NY'
        )
        db.session.add(emp_profile2)

        # Create seekers
        seeker1 = User(name='Alice Brown', email='alice@email.com', role='seeker')
        seeker1.set_password('password')
        db.session.add(seeker1)

        seeker2 = User(name='Bob Wilson', email='bob@email.com', role='seeker')
        seeker2.set_password('password')
        db.session.add(seeker2)

        seeker3 = User(name='Carol Davis', email='carol@email.com', role='seeker')
        seeker3.set_password('password')
        db.session.add(seeker3)

        db.session.commit()

        # Create seeker profiles
        seek_profile1 = SeekerProfile(
            user_id=seeker1.id,
            bio='Passionate software developer with 3 years experience.',
            skills='Python, JavaScript, React, SQL',
            experience='[{"title": "Junior Developer", "company": "Startup Inc", "duration": "2021-2023"}]',
            education='[{"degree": "BS Computer Science", "institution": "State University", "year": "2021"}]',
            location='Boston, MA',
            job_type_pref='full-time',
            profile_complete_pct=80
        )
        db.session.add(seek_profile1)

        seek_profile2 = SeekerProfile(
            user_id=seeker2.id,
            bio='Marketing specialist seeking new opportunities.',
            skills='Digital Marketing, SEO, Content Creation',
            location='Chicago, IL',
            job_type_pref='remote',
            profile_complete_pct=60
        )
        db.session.add(seek_profile2)

        seek_profile3 = SeekerProfile(
            user_id=seeker3.id,
            bio='Recent graduate eager to start career in tech.',
            skills='Python, HTML, CSS',
            education='[{"degree": "BA Computer Science", "institution": "City College", "year": "2023"}]',
            location='Austin, TX',
            job_type_pref='internship',
            profile_complete_pct=50
        )
        db.session.add(seek_profile3)

        # Create jobs
        jobs_data = [
            {
                'employer_id': employer1.id,
                'title': 'Senior Python Developer',
                'company': 'TechCorp',
                'location': 'San Francisco, CA',
                'job_type': 'full-time',
                'salary_min': 80000,
                'salary_max': 120000,
                'description': 'We are looking for a senior Python developer to join our team...',
                'requirements': '5+ years Python experience, Django knowledge',
                'skills_required': 'Python, Django, PostgreSQL, AWS',
                'experience_level': 'senior'
            },
            {
                'employer_id': employer1.id,
                'title': 'Frontend Developer',
                'company': 'TechCorp',
                'location': 'Remote',
                'job_type': 'remote',
                'salary_min': 60000,
                'salary_max': 90000,
                'description': 'Join our frontend team to build amazing user experiences...',
                'requirements': '3+ years React experience',
                'skills_required': 'JavaScript, React, CSS, HTML',
                'experience_level': 'mid'
            },
            {
                'employer_id': employer2.id,
                'title': 'Marketing Coordinator',
                'company': 'Innovate Solutions',
                'location': 'New York, NY',
                'job_type': 'full-time',
                'salary_min': 45000,
                'salary_max': 65000,
                'description': 'Help drive our marketing campaigns and grow our brand...',
                'requirements': '2+ years marketing experience',
                'skills_required': 'Digital Marketing, Social Media, Analytics',
                'experience_level': 'mid'
            },
            {
                'employer_id': employer2.id,
                'title': 'Data Analyst Intern',
                'company': 'Innovate Solutions',
                'location': 'New York, NY',
                'job_type': 'internship',
                'salary_min': 20000,
                'salary_max': 30000,
                'description': 'Learn data analysis skills while contributing to real projects...',
                'requirements': 'Basic SQL knowledge, Excel proficiency',
                'skills_required': 'SQL, Excel, Python',
                'experience_level': 'entry'
            },
            {
                'employer_id': employer1.id,
                'title': 'DevOps Engineer',
                'company': 'TechCorp',
                'location': 'San Francisco, CA',
                'job_type': 'full-time',
                'salary_min': 90000,
                'salary_max': 130000,
                'description': 'Manage our cloud infrastructure and CI/CD pipelines...',
                'requirements': '4+ years DevOps experience',
                'skills_required': 'AWS, Docker, Kubernetes, Jenkins',
                'experience_level': 'senior'
            },
            {
                'employer_id': employer2.id,
                'title': 'UX Designer',
                'company': 'Innovate Solutions',
                'location': 'Remote',
                'job_type': 'freelance',
                'salary_min': 50000,
                'salary_max': 80000,
                'description': 'Design intuitive user experiences for our clients...',
                'requirements': '3+ years UX design experience, Figma proficiency',
                'skills_required': 'UX Design, Figma, User Research, Prototyping',
                'experience_level': 'mid'
            }
        ]

        for job_data in jobs_data:
            job = Job(**job_data)
            db.session.add(job)

        db.session.commit()

        # Create applications
        app1 = Application(
            job_id=1,
            seeker_id=seeker1.id,
            cover_letter='I am excited to apply for this position...',
            status='shortlisted'
        )
        db.session.add(app1)

        app2 = Application(
            job_id=2,
            seeker_id=seeker1.id,
            status='applied'
        )
        db.session.add(app2)

        app3 = Application(
            job_id=3,
            seeker_id=seeker2.id,
            status='viewed'
        )
        db.session.add(app3)

        app4 = Application(
            job_id=4,
            seeker_id=seeker3.id,
            status='hired'
        )
        db.session.add(app4)

        db.session.commit()

        print("Database seeded successfully!")

if __name__ == '__main__':
    seed_data()