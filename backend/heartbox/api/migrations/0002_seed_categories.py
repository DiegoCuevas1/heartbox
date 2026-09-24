from django.db import migrations

CATEGORIES = [
    'Wedding', 'Christmas', 'Birthday', 'Anniversary', 'Graduation',
    'New Year', 'Halloween', "Valentine's", 'Other',
]


def seed(apps, schema_editor):
    Category = apps.get_model('api', 'Category')
    for name in CATEGORIES:
        Category.objects.get_or_create(name=name, defaults={'description': f'{name} relics'})


class Migration(migrations.Migration):
    dependencies = [('api', '0001_initial')]
    operations = [migrations.RunPython(seed, migrations.RunPython.noop)]
