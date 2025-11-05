"""
Utilitaires pour la génération de PDF de factures.
"""
import os
from datetime import datetime
from decimal import Decimal
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from django.conf import settings
from django.http import HttpResponse
from django.utils import timezone


def generate_invoice_pdf(vente, response=None):
    """
    Génère un PDF de facture pour une vente.
    
    Args:
        vente: Instance du modèle Vente
        response: HttpResponse object (optionnel)
    
    Returns:
        HttpResponse avec le PDF généré
    """
    # Créer le nom du fichier
    filename = f"facture_{vente.numero_facture}.pdf"
    
    # Créer la réponse HTTP si pas fournie
    if response is None:
        response = HttpResponse(content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
    
    # Créer le document PDF
    doc = SimpleDocTemplate(response, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm)
    
    # Styles
    styles = getSampleStyleSheet()
    
    # Styles personnalisés
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#2563eb')
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#6b7280')
    )
    
    header_style = ParagraphStyle(
        'Header',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=10,
        textColor=colors.HexColor('#374151')
    )
    
    # Contenu du PDF
    story = []
    
    # En-tête de la facture
    story.append(Paragraph("FACTURE", title_style))
    story.append(Paragraph(f"N° {vente.numero_facture}", subtitle_style))
    story.append(Spacer(1, 20))
    
    # Informations de l'entreprise et du client
    info_data = [
        ['INFORMATIONS ENTREPRISE', 'INFORMATIONS CLIENT'],
        [
            f"""
            <b>{vente.entrepreneur.entreprise.nom if hasattr(vente.entrepreneur, 'entreprise') else 'Votre Entreprise'}</b><br/>
            {vente.entrepreneur.entreprise.adresse_complete if hasattr(vente.entrepreneur, 'entreprise') else 'Adresse de l\'entreprise'}<br/>
            Tél: {vente.entrepreneur.entreprise.telephone if hasattr(vente.entrepreneur, 'entreprise') else 'N/A'}<br/>
            Email: {vente.entrepreneur.entreprise.email if hasattr(vente.entrepreneur, 'entreprise') else 'N/A'}
            """,
            f"""
            <b>{vente.client.nom if vente.client else 'Client anonyme'}</b><br/>
            {vente.client.email if vente.client and vente.client.email else 'N/A'}<br/>
            Tél: {vente.client.telephone if vente.client and vente.client.telephone else 'N/A'}<br/>
            {vente.adresse_livraison if vente.adresse_livraison else 'Adresse non spécifiée'}
            """
        ]
    ]
    
    info_table = Table(info_data, colWidths=[9*cm, 9*cm])
    info_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#374151')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
    ]))
    
    story.append(info_table)
    story.append(Spacer(1, 30))
    
    # Détails de la facture
    story.append(Paragraph("DÉTAILS DE LA FACTURE", header_style))
    
    # Tableau des articles
    table_data = [
        ['Article', 'SKU', 'Quantité', 'Prix unitaire', 'Remise', 'Total HT', 'TVA', 'Total TTC']
    ]
    
    total_ht = Decimal('0.00')
    total_tva = Decimal('0.00')
    total_ttc = Decimal('0.00')
    
    for ligne in vente.lignes.all():
        prix_avec_remise = ligne.prix_unitaire * (1 - ligne.remise_pourcentage / 100)
        total_ligne_ht = ligne.quantite * prix_avec_remise
        total_ligne_tva = total_ligne_ht * (ligne.tva_taux / 100)
        total_ligne_ttc = total_ligne_ht + total_ligne_tva
        
        total_ht += total_ligne_ht
        total_tva += total_ligne_tva
        total_ttc += total_ligne_ttc
        
        table_data.append([
            ligne.produit.nom,
            ligne.produit.sku,
            str(ligne.quantite),
            f"{ligne.prix_unitaire:,.0f} XOF",
            f"{ligne.remise_pourcentage}%" if ligne.remise_pourcentage > 0 else "-",
            f"{total_ligne_ht:,.0f} XOF",
            f"{total_ligne_tva:,.0f} XOF",
            f"{total_ligne_ttc:,.0f} XOF"
        ])
    
    # Ajouter les totaux
    table_data.append(['', '', '', '', '', '', '', ''])
    table_data.append([
        '', '', '', '', '', 
        f"<b>{total_ht:,.0f} XOF</b>",
        f"<b>{total_tva:,.0f} XOF</b>",
        f"<b>{total_ttc:,.0f} XOF</b>"
    ])
    
    # Créer le tableau
    table = Table(table_data, colWidths=[3*cm, 2*cm, 1.5*cm, 2*cm, 1.5*cm, 2*cm, 1.5*cm, 2*cm])
    table.setStyle(TableStyle([
        # En-tête
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2563eb')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, 0), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        
        # Corps du tableau
        ('BACKGROUND', (0, 1), (-1, -3), colors.white),
        ('TEXTCOLOR', (0, 1), (-1, -3), colors.HexColor('#374151')),
        ('ALIGN', (0, 1), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
        ('RIGHTPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        
        # Ligne des totaux
        ('BACKGROUND', (0, -2), (-1, -1), colors.HexColor('#f9fafb')),
        ('FONTNAME', (0, -2), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, -2), (-1, -1), 10),
    ]))
    
    story.append(table)
    story.append(Spacer(1, 30))
    
    # Informations de paiement
    payment_info = f"""
    <b>Mode de paiement:</b> {vente.get_mode_paiement_display()}<br/>
    <b>Statut du paiement:</b> {vente.get_statut_paiement_display()}<br/>
    <b>Date de création:</b> {vente.date_creation.strftime('%d/%m/%Y à %H:%M')}<br/>
    """
    
    if vente.date_paiement:
        payment_info += f"<b>Date de paiement:</b> {vente.date_paiement.strftime('%d/%m/%Y à %H:%M')}<br/>"
    
    if vente.reference_paiement:
        payment_info += f"<b>Référence de paiement:</b> {vente.reference_paiement}<br/>"
    
    story.append(Paragraph("INFORMATIONS DE PAIEMENT", header_style))
    story.append(Paragraph(payment_info, styles['Normal']))
    
    # Notes
    if vente.notes:
        story.append(Spacer(1, 20))
        story.append(Paragraph("NOTES", header_style))
        story.append(Paragraph(vente.notes, styles['Normal']))
    
    # Pied de page
    story.append(Spacer(1, 40))
    footer_text = f"""
    <i>Facture générée le {datetime.now().strftime('%d/%m/%Y à %H:%M')} - 
    Système de gestion commerciale</i>
    """
    story.append(Paragraph(footer_text, ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#9ca3af')
    )))
    
    # Construire le PDF
    doc.build(story)
    
    return response


def generate_invoice_pdf_file(vente, filepath):
    """
    Génère un fichier PDF de facture et le sauvegarde sur le disque.
    
    Args:
        vente: Instance du modèle Vente
        filepath: Chemin où sauvegarder le fichier PDF
    
    Returns:
        Chemin du fichier généré
    """
    with open(filepath, 'wb') as f:
        response = HttpResponse(content_type='application/pdf')
        response.write = f.write
        generate_invoice_pdf(vente, response)
    
    return filepath
