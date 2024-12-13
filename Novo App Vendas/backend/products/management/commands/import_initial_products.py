from django.core.management.base import BaseCommand
from products.models import Product

INITIAL_PRODUCTS = {
    'compactadores': [
        'Compactador de Solo VMR-75H',
        'Compactador De Solo VMR-60',
        'Compactador de Solo VMR-75R',
        'Compactador de Solo VMR-680',
        'Compactador De Solo VMR-75',
    ],
    'placas': [
        'Placa Vibratória Reversível VK-400',
        'Placa Vibratória Reversível VK-300',
        'Placa Vibratória VK-120',
        'Placa Vibratória VK-85',
    ],
    'cortadoras': [
        'Cortadora De Piso E Asfalto CPV-350',
        'Cortadora De Piso E Asfalto CPV-460',
    ],
    'bombas': [
        'Bomba De Mangote Compacta – 2 Pol',
        'Bomba De Mangote Em Ferro Fundido 2 Á 3 Pol',
        'Bomba Mangote Em Alumínio De 2 A 3 Pol',
    ],
    'vibradores': [
        'Vibrador De Concreto Portátil',
        'Vibrador De Imersão De Alta Frequência',
        'Vibrador De Concreto Pendular',
    ],
    'motores': [
        'Motor Vibromak RM120-V',
        'Motovibrador À Gasolina',
        'Motor Elétrico Dupla Isolação',
    ],
    'outros': [
        'Regua Vibratória RVVK',
    ],
}

class Command(BaseCommand):
    help = 'Import initial products from product-categories.md'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be imported without actually importing',
        )

    def generate_product_code(self, name, category, used_codes, category_counter):
        # Special cases for specific categories
        category_prefix = category[:3].upper()
        
        if category == 'bombas':
            if 'Compacta' in name:
                base_code = f"{category_prefix}-MC-2"  # Mangote Compacta
            elif 'Ferro' in name:
                base_code = f"{category_prefix}-MF-23"  # Mangote Ferro
            else:
                base_code = f"{category_prefix}-MA-23"  # Mangote Alumínio
        
        elif category == 'vibradores':
            if 'Portátil' in name:
                base_code = f"{category_prefix}-CP"  # Concreto Portátil
            elif 'Imersão' in name:
                base_code = f"{category_prefix}-IAF"  # Imersão Alta Frequência
            else:
                base_code = f"{category_prefix}-CPE"  # Concreto Pendular
        
        elif category == 'motores':
            if 'RM120' in name:
                base_code = f"{category_prefix}-RM120"
            elif 'Gasolina' in name:
                base_code = f"{category_prefix}-GAS"
            else:
                base_code = f"{category_prefix}-ELE"  # Elétrico
        
        else:
            # Default code generation for other categories
            code_parts = [category_prefix]
            
            # Add numeric parts from name
            numeric_parts = [part for part in name.split() if any(c.isdigit() for c in part)]
            if numeric_parts:
                code_parts.extend(numeric_parts)
            else:
                # If no numeric parts, use model identifier if present
                model_identifiers = [part for part in name.split() if part.isupper()]
                if model_identifiers:
                    code_parts.extend(model_identifiers)
            
            base_code = '-'.join(code_parts)
        
        # Ensure code is unique by adding counter if needed
        final_code = base_code
        while final_code in used_codes:
            final_code = f"{base_code}-{category_counter}"
            category_counter += 1
        
        return final_code, category_counter

    def handle(self, *args, **kwargs):
        dry_run = kwargs['dry_run']
        used_codes = {}
        
        if dry_run:
            self.stdout.write(self.style.WARNING("\nPREVIEW MODE - No changes will be made\n"))
            
        for category, products in INITIAL_PRODUCTS.items():
            if dry_run:
                self.stdout.write(self.style.SUCCESS(f"\nCategory: {category}"))
                self.stdout.write("-" * 50)
            
            category_counter = 1
            for name in products:
                final_code, category_counter = self.generate_product_code(
                    name, category, used_codes, category_counter
                )
                used_codes[final_code] = True
                
                if dry_run:
                    self.stdout.write(f"Product: {name}")
                    self.stdout.write(f"Code: {final_code}\n")
                else:
                    # Create product if it doesn't exist
                    product, created = Product.objects.get_or_create(
                        name=name,
                        defaults={
                            'code': final_code,
                            'category': category,
                            'price': 0.00,  # Default price, should be updated later
                            'specs': {},  # Empty specs, should be updated later
                        }
                    )
                    
                    if created:
                        self.stdout.write(self.style.SUCCESS(f'Created product: {name} (Code: {final_code})'))
                    else:
                        self.stdout.write(self.style.WARNING(f'Product already exists: {name}'))
        
        if dry_run:
            self.stdout.write(self.style.WARNING("\nThis was a preview. Run without --dry-run to perform the actual import."))
