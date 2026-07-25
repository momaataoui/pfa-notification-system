package com.pfa.rexel.notification.entity;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    // ===== Identifiant =====

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ===== Destinataire =====
    // À qui cette notification est destinée

    @Enumerated(EnumType.STRING)
    private RecipientType recipientType;   // USER, GROUP ou BROADCAST

    private String recipientEmail;         // email du destinataire (simple texte)

    // ===== Contenu =====
    // Ce que la notification affiche

    private String title;

    private String message;

    // ===== Canaux d'envoi =====
    // Sur quel(s) canal(aux) cette notification part (peut être plusieurs à la fois)

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
            name = "notification_channels",
            joinColumns = @JoinColumn(name = "notification_id")
    )
    @Enumerated(EnumType.STRING)
    @Column(name = "channel")
    private Set<Channel> channels;         // ex: [PUSH, EMAIL]

    // ===== Métadonnées =====
    // Informations complémentaires sur la notification elle-même

    @Enumerated(EnumType.STRING)
    private Priority priority;             // LOW, NORMAL, HIGH

    private String sourceEventType;        // ex: "ORDER_SHIPPED" (traçabilité)

    private boolean read = false;          // lue ou non par le destinataire

    private LocalDateTime createdAt;       // date de création
}