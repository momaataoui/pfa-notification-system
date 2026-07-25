package com.pfa.rexel.notification.service;

import com.pfa.rexel.notification.entity.Channel;
import org.springframework.stereotype.Service;

import java.util.Set;

@Service
public class ChannelDecisionService {

    public Set<Channel> decideChannels(String type, String urgency) {
        return switch (type) {
            case "ORDER_CREATED", "ORDER_PAID", "ORDER_SHIPPED", "ORDER_DELIVERED",
                 "PRODUCT_REQUEST_CREATED", "PRODUCT_REQUEST_APPROVED", "PRODUCT_REQUEST_REJECTED" ->
                    Set.of(Channel.PUSH, Channel.EMAIL);
            case "ORDER_CANCELLED" -> Set.of(Channel.PUSH);
            case "LOW_STOCK_ALERT" -> Set.of(Channel.EMAIL);
            default -> Set.of();
        };
    }
}
/*rexel-mini-store                    Kafka                    notification-service
      │                        (topic: rexel.events)                  │
      │  1. Client passe commande                                     │
      │                                                                │
      │  2. kafkaTemplate.send(...)                                   │
      │  ────────────────────────────▶  { "type": "ORDER_CREATED",    │
      │                                    "userId": "john@...",      │
      │                                    "message": "..." }         │
      │                                          │                     │
      │                                          │  3. @KafkaListener  │
      │                                          ──────────────────▶  │
      │                                                                │
      │                                                4. NotificationEventListener.onMessage()
      │                                                5. NotificationService.createFromEvent()
      │                                                6. Sauvegarde en base (pfa_notifications)
*/