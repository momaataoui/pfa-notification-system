package com.pfa.rexel.notification.service;

import com.pfa.rexel.notification.entity.Notification;
import com.pfa.rexel.notification.entity.RecipientType;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PushNotificationSender {

    private final SimpMessagingTemplate messagingTemplate;

    public void send(Notification notification) {
        if (notification.getRecipientType() == RecipientType.BROADCAST) {
            messagingTemplate.convertAndSend("/topic/notifications", notification);
        } else {
            messagingTemplate.convertAndSendToUser(
                    notification.getRecipientEmail(),
                    "/queue/notifications",
                    notification
            );
        }
    }
}
