package com.pfa.rexel.notification.event;

import com.pfa.rexel.notification.cqrs.command.CreateNotificationCommand;
import com.pfa.rexel.notification.entity.Channel;
import com.pfa.rexel.notification.entity.Priority;
import com.pfa.rexel.notification.entity.RecipientType;
import com.pfa.rexel.notification.service.ChannelDecisionService;
import lombok.RequiredArgsConstructor;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private final ChannelDecisionService channelDecisionService;
    private final CommandGateway commandGateway;

    @KafkaListener(topics = "rexel.events", groupId = "notification-service")
    public void onMessage(RexelEvent event) {
        Set<Channel> channels = channelDecisionService.decideChannels(event.getType(), event.getUrgency());

        commandGateway.sendAndWait(new CreateNotificationCommand(
                UUID.randomUUID().toString(),
                RecipientType.USER,
                event.getUserId(),
                event.getType(),
                event.getMessage(),
                channels,
                mapUrgencyToPriority(event.getUrgency()),
                event.getType()
        ));
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
