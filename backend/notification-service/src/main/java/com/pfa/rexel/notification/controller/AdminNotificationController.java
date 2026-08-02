package com.pfa.rexel.notification.controller;

import com.pfa.rexel.notification.cqrs.command.CreateNotificationCommand;
import com.pfa.rexel.notification.dto.AdminNotificationCreateRequest;
import com.pfa.rexel.notification.dto.NotificationStatsResponse;
import com.pfa.rexel.notification.entity.DeliveryStatus;
import com.pfa.rexel.notification.entity.Notification;
import com.pfa.rexel.notification.entity.RecipientType;
import com.pfa.rexel.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;
    private final CommandGateway commandGateway;

    @PostMapping
    public ResponseEntity<Notification> create(@Valid @RequestBody AdminNotificationCreateRequest request) {
        String aggregateId = UUID.randomUUID().toString();

        commandGateway.sendAndWait(new CreateNotificationCommand(
                aggregateId,
                request.getRecipientType(),
                request.getRecipientType() == RecipientType.USER ? request.getRecipientEmail() : null,
                request.getTitle(),
                request.getMessage(),
                request.getChannels(),
                request.getPriority(),
                null
        ));

        // sendAndWait() ne rend la main qu'une fois la commande traitee ET les
        // @EventHandler synchrones (NotificationProjection) executes -> la ligne
        // de projection existe deja a ce stade.
        Notification created = notificationService.findByAggregateId(aggregateId)
                .orElseThrow(() -> new IllegalStateException("Projection introuvable pour " + aggregateId));

        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    public List<Notification> getAll(@RequestParam(required = false) DeliveryStatus status) {
        return status != null
                ? notificationService.findByDeliveryStatus(status)
                : notificationService.findAll();
    }

    @GetMapping("/stats")
    public NotificationStatsResponse getStats() {
        return notificationService.getStats();
    }
}
