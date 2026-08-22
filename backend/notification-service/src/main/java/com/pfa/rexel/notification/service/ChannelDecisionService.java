package com.pfa.rexel.notification.service;

import com.pfa.rexel.notification.entity.Channel;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
public class ChannelDecisionService {

    // HashSet (mutable) plutot que Set.of(...) (immuable) : le type interne
    // JDK renvoye par Set.of() (java.util.ImmutableCollections$SetN) n'est pas
    // serialisable par XStream (le serialiseur par defaut d'Axon) - il casse
    // silencieusement l'ecriture dans l'event store des qu'une commande passe
    // par ChannelDecisionService (donc uniquement le chemin Kafka).
    public Set<Channel> decideChannels(String type, String urgency) {
        return switch (type) {
            case "ORDER_CREATED", "ORDER_SHIPPED", "ORDER_DELIVERED" ->
                    new HashSet<>(Set.of(Channel.PUSH, Channel.EMAIL, Channel.SMS));
            case "PRODUCT_REQUEST_CREATED", "PRODUCT_REQUEST_APPROVED", "PRODUCT_REQUEST_REJECTED" ->
                    new HashSet<>(Set.of(Channel.PUSH, Channel.EMAIL));
            case "ORDER_CANCELLED", "ADMIN_NEW_ORDER" -> new HashSet<>(Set.of(Channel.PUSH));
            case "LOW_STOCK_ALERT" -> new HashSet<>(Set.of(Channel.EMAIL));
            default -> new HashSet<>();
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