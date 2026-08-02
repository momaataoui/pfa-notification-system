package com.pfa.rexel.notification.cqrs.projection;

import com.pfa.rexel.notification.cqrs.event.NotificationCreatedEvent;
import com.pfa.rexel.notification.cqrs.event.NotificationReadEvent;
import com.pfa.rexel.notification.entity.Channel;
import com.pfa.rexel.notification.entity.DeliveryStatus;
import com.pfa.rexel.notification.entity.Notification;
import com.pfa.rexel.notification.repository.NotificationRepository;
import com.pfa.rexel.notification.service.EmailSender;
import com.pfa.rexel.notification.service.PushNotificationSender;
import lombok.RequiredArgsConstructor;
import org.axonframework.config.ProcessingGroup;
import org.axonframework.eventhandling.EventHandler;
import org.springframework.stereotype.Component;

// La Projection ecoute les events (le passe, deja arrive) et construit/maintient
// la table de LECTURE (`notifications`) que consultent GET /me et
// GET /api/admin/notifications. C'est le cote "Query" du CQRS : elle ne decide
// jamais rien, elle se contente de refleter ce que l'agregat a deja valide.
//
// @ProcessingGroup donne un nom EXPLICITE sans point (au lieu du nom de
// package par defaut) : necessaire pour pouvoir le referencer proprement dans
// application.yml (axon.eventhandling.processors.<nom>.mode).
@Component
@ProcessingGroup("notification-projection")
@RequiredArgsConstructor
public class NotificationProjection {

    private final NotificationRepository notificationRepository;
    private final PushNotificationSender pushNotificationSender;
    private final EmailSender emailSender;

    @EventHandler
    public void on(NotificationCreatedEvent event) {
        Notification notification = new Notification();
        notification.setAggregateId(event.getAggregateId());
        notification.setRecipientType(event.getRecipientType());
        notification.setRecipientEmail(event.getRecipientEmail());
        notification.setTitle(event.getTitle());
        notification.setMessage(event.getMessage());
        notification.setChannels(event.getChannels());
        notification.setPriority(event.getPriority());
        notification.setSourceEventType(event.getSourceEventType());
        notification.setRead(false);
        notification.setCreatedAt(event.getCreatedAt());

        Notification saved = notificationRepository.save(notification);
        dispatch(saved);
    }

    @EventHandler
    public void on(NotificationReadEvent event) {
        notificationRepository.findByAggregateId(event.getAggregateId()).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
    }

    // Meme logique que l'ancien NotificationService.dispatch() : tenter chaque
    // canal actif, retenir la premiere raison d'echec, en deduire le statut
    // global, puis persister.
    private void dispatch(Notification saved) {
        boolean anyAttempted = false;
        String failureReason = null;

        if (saved.getChannels().contains(Channel.PUSH)) {
            anyAttempted = true;
            String reason = pushNotificationSender.send(saved);
            if (reason != null) {
                failureReason = reason;
            }
        }

        if (saved.getChannels().contains(Channel.EMAIL)) {
            anyAttempted = true;
            String reason = emailSender.send(saved);
            if (reason != null) {
                failureReason = reason;
            }
        }

        saved.setDeliveryStatus(!anyAttempted
                ? DeliveryStatus.PENDING
                : (failureReason == null ? DeliveryStatus.DELIVERED : DeliveryStatus.FAILED));
        saved.setFailureReason(failureReason);
        notificationRepository.save(saved);
    }
}
