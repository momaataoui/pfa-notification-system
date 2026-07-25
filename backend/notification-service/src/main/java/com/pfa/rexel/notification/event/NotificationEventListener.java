package com.pfa.rexel.notification.event;

import com.pfa.rexel.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final NotificationService notificationService;

    @KafkaListener(topics = "rexel.events", groupId = "notification-service")
    public void onMessage(RexelEvent event) {
        notificationService.createFromEvent(event);
    }
}
