package com.pfa.rexel.notification.service;

import com.pfa.rexel.notification.dto.AdminNotificationCreateRequest;
import com.pfa.rexel.notification.entity.Channel;
import com.pfa.rexel.notification.entity.Notification;
import com.pfa.rexel.notification.entity.Priority;
import com.pfa.rexel.notification.entity.RecipientType;
import com.pfa.rexel.notification.event.RexelEvent;
import com.pfa.rexel.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final ChannelDecisionService channelDecisionService;
    private final PushNotificationSender pushNotificationSender;

    public Notification createFromEvent(RexelEvent event) {
        Set<Channel> channels = channelDecisionService.decideChannels(event.getType(), event.getUrgency());

        Notification notification = new Notification();
        notification.setRecipientType(RecipientType.USER);
        notification.setRecipientEmail(event.getUserId());
        notification.setTitle(event.getType());
        notification.setMessage(event.getMessage());
        notification.setChannels(channels);
        notification.setPriority(mapUrgencyToPriority(event.getUrgency()));
        notification.setSourceEventType(event.getType());
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        Notification saved = notificationRepository.save(notification);

        if (saved.getChannels().contains(Channel.PUSH)) {
            pushNotificationSender.send(saved);
        }

        return saved;
    }
public Notification createManual(AdminNotificationCreateRequest request) {
    Notification notification = new Notification();
    notification.setRecipientType(request.getRecipientType());
    notification.setRecipientEmail(
            request.getRecipientType() == RecipientType.USER ? request.getRecipientEmail() : null
    );
    notification.setTitle(request.getTitle());
    notification.setMessage(request.getMessage());
    notification.setChannels(request.getChannels());
    notification.setPriority(request.getPriority());
    notification.setSourceEventType(null);
    notification.setRead(false);
    notification.setCreatedAt(LocalDateTime.now());

    Notification saved = notificationRepository.save(notification);

    if (saved.getChannels().contains(Channel.PUSH)) {
        pushNotificationSender.send(saved);
    }

    return saved;
}

    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable: " + id));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public List<Notification> findForUser(String email) {
        return notificationRepository.findByRecipientEmailOrRecipientType(email, RecipientType.BROADCAST);
    }

    private Priority mapUrgencyToPriority(String urgency) {
        if (urgency == null) {
            return Priority.NORMAL;
        }
        return switch (urgency.toLowerCase()) {
            case "high" -> Priority.HIGH;
            case "low" -> Priority.LOW;
            default -> Priority.NORMAL;
        };
    }
}
