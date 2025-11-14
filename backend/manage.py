#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys

if __name__ == '__main__':
    """Run administrative tasks."""
    # Ne pas définir de default - laisser Render utiliser DJANGO_SETTINGS_MODULE
    # os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    if 'DJANGO_SETTINGS_MODULE' not in os.environ:
        # Fallback uniquement pour développement local
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)