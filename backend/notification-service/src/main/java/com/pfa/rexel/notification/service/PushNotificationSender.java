package com.pfa.rexel.notification.service;

import com.pfa.rexel.notification.entity.Notification;
import com.pfa.rexel.notification.entity.RecipientType;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PushNotificationSender {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationSender.class);

    private final SimpMessagingTemplate messagingTemplate;

    /**
     * @return null si l'envoi a ete tente sans erreur, sinon la raison de l'echec.
     * Note : aucun accuse de reception WebSocket n'existe, donc un retour null
     * signifie seulement "message transmis au broker", pas "recu par le client".
     */
    public String send(Notification notification) {
        try {
            if (notification.getRecipientType() == RecipientType.BROADCAST) {
                messagingTemplate.convertAndSend("/topic/notifications", notification);
            } else {
                messagingTemplate.convertAndSendToUser(
                        notification.getRecipientEmail(),
                        "/queue/notifications",
                        notification
                );
            }
            return null;
        } catch (Exception e) {
            log.error("Echec de l'envoi push pour la notification {} : {}", notification.getId(), e.getMessage());
            return e.getMessage();
        }
    }
}
