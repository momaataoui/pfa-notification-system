package com.pfa.rexel.store.service;

import com.pfa.rexel.store.event.RexelEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class KafkaEventPublisher {

    private static final String TOPIC = "rexel.events";

    private final KafkaTemplate<String, RexelEvent> kafkaTemplate;

    public void publish(String userId, String message, String type, String urgency) {
        RexelEvent event = new RexelEvent(userId, message, type, urgency);
        kafkaTemplate.send(TOPIC, event);
    }
}
