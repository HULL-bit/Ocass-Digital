"""
Script pour créer les comptes de test depuis LoginPage.tsx
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.companies.models import Entreprise

User = get_user_model()


class Command(BaseCommand):
    help = 'Crée les comptes de test pour LoginPage'

    def get_unique_username(self, base_username):
        """Génère un username unique en ajoutant un numéro si nécessaire."""
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        return username

    def handle(self, *args, **options):
        # Comptes admin
        admins = [
            {'email': 'admin@platform.com', 'name': 'Super Admin', 'password': 'password'},
            {'email': 'admin2@platform.com', 'name': 'Moussa Fall', 'password': 'admin123'},
            {'email': 'admin3@platform.com', 'name': 'Khadija Ndiaye', 'password': 'admin123'},
            {'email': 'admin1@platform.com', 'name': 'Aminata Diop', 'password': 'admin123'},
            {'email': 'admin4@platform.com', 'name': 'Ibrahima Sow', 'password': 'admin123'},
            {'email': 'admin5@platform.com', 'name': 'Aïcha Ba', 'password': 'admin123'},
        ]

        # Comptes entrepreneur
        entrepreneurs = [
            {'email': 'fatou@pharmaciemoderne.sn', 'name': 'Fatou Sow (Pharmacie)', 'password': 'password'},
            {'email': 'marie@boutiquemarie.sn', 'name': 'Marie Diallo (Boutique)', 'password': 'password'},
            {'email': 'amadou@techsolutions.sn', 'name': 'Amadou Ba (Tech)', 'password': 'password'},
        ]

        # Comptes client
        clients = [
            {'email': 'client1@example.com', 'name': 'Abdou Samb', 'password': 'password'},
            {'email': 'client2@example.com', 'name': 'Aïcha Fall', 'password': 'password'},
            {'email': 'client3@example.com', 'name': 'Moussa Ndiaye', 'password': 'password'},
        ]

        created_count = 0
        updated_count = 0

        # Créer les admins
        for admin_data in admins:
            email = admin_data['email']
            name_parts = admin_data['name'].split(' ', 1)
            first_name = name_parts[0] if len(name_parts) > 0 else ''
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            base_username = email.split('@')[0]  # Utiliser la partie avant @ comme username
            username = self.get_unique_username(base_username)
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'type_utilisateur': 'admin',
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_staff': True,
                    'is_superuser': email == 'admin@platform.com',
                    'is_active': True,
                }
            )
            if created:
                user.set_password(admin_data['password'])
                user.save()
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✅ Admin créé: {email}'))
            else:
                user.set_password(admin_data['password'])
                if not user.username:
                    user.username = username
                user.save()
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'🔄 Admin mis à jour: {email}'))

        # Créer les entrepreneurs avec leurs entreprises
        for ent_data in entrepreneurs:
            email = ent_data['email']
            name_parts = ent_data['name'].split(' ', 1)
            first_name = name_parts[0] if len(name_parts) > 0 else ''
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            base_username = email.split('@')[0]  # Utiliser la partie avant @ comme username
            username = self.get_unique_username(base_username)
            
            # Définir les données de l'entreprise selon l'email
            company_data = None
            if 'pharmaciemoderne' in email:
                company_data = {
                    'nom': 'Pharmacie Moderne',
                    'secteur_activite': 'commerce_pharmaceutique',
                    'adresse_complete': '123 Avenue de la République',
                    'ville': 'Dakar',
                    'region': 'Dakar',
                }
            elif 'boutiquemarie' in email:
                company_data = {
                    'nom': 'Boutique Marie Diallo',
                    'secteur_activite': 'commerce_textile',
                    'adresse_complete': '456 Rue de la Mode',
                    'ville': 'Thiès',
                    'region': 'Thiès',
                }
            elif 'techsolutions' in email:
                company_data = {
                    'nom': 'TechSolutions Sénégal',
                    'secteur_activite': 'commerce_electronique',
                    'adresse_complete': '789 Boulevard du Technopole',
                    'ville': 'Dakar',
                    'region': 'Dakar',
                }
            
            # Créer l'entreprise d'abord si elle n'existe pas
            entreprise = None
            if company_data:
                # Générer un SIRET unique pour chaque entreprise
                import uuid
                siret_unique = f"SN{str(uuid.uuid4())[:8].upper().replace('-', '')}"
                
                entreprise, _ = Entreprise.objects.get_or_create(
                    nom=company_data['nom'],
                    defaults={
                        'email': email,
                        'telephone': '+221 77 XXX XX XX',
                        'secteur_activite': company_data['secteur_activite'],
                        'adresse_complete': company_data['adresse_complete'],
                        'ville': company_data['ville'],
                        'region': company_data['region'],
                        'pays': 'Sénégal',
                        'siret': siret_unique,
                        'statut': 'actif',
                    }
                )
            
            # Créer l'utilisateur entrepreneur avec l'entreprise
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'type_utilisateur': 'entrepreneur',
                    'first_name': first_name,
                    'last_name': last_name,
                    'entreprise': entreprise,
                    'is_active': True,
                }
            )
            
            if created:
                user.set_password(ent_data['password'])
                user.save()
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✅ Entrepreneur créé: {email}'))
            else:
                user.set_password(ent_data['password'])
                if not user.username:
                    user.username = username
                if not user.entreprise and entreprise:
                    user.entreprise = entreprise
                user.save()
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'🔄 Entrepreneur mis à jour: {email}'))

        # Créer les clients
        for client_data in clients:
            email = client_data['email']
            name_parts = client_data['name'].split(' ', 1)
            first_name = name_parts[0] if len(name_parts) > 0 else ''
            last_name = name_parts[1] if len(name_parts) > 1 else ''
            base_username = email.split('@')[0]  # Utiliser la partie avant @ comme username
            username = self.get_unique_username(base_username)
            
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    'username': username,
                    'type_utilisateur': 'client',
                    'first_name': first_name,
                    'last_name': last_name,
                    'is_active': True,
                }
            )
            if created:
                user.set_password(client_data['password'])
                user.save()
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'✅ Client créé: {email}'))
            else:
                user.set_password(client_data['password'])
                if not user.username:
                    user.username = username
                user.save()
                updated_count += 1
                self.stdout.write(self.style.WARNING(f'🔄 Client mis à jour: {email}'))

        self.stdout.write(self.style.SUCCESS(
            f'\n🎉 Résumé: {created_count} comptes créés, {updated_count} comptes mis à jour'
        ))

