package com.pfa.rexel.notification.controller;

import com.pfa.rexel.notification.cqrs.command.MarkAsReadCommand;
import com.pfa.rexel.notification.entity.Notification;
import com.pfa.rexel.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.axonframework.commandhandling.gateway.CommandGateway;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final CommandGateway commandGateway;

    @GetMapping("/me")
    public List<Notification> getMyNotifications(@AuthenticationPrincipal Jwt jwt) {
        return notificationService.findForUser(jwt.getClaimAsString("email"));
    }

    @PatchMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        Notification notification = notificationService.findById(id);

        if (notification.getAggregateId() != null) {
            commandGateway.sendAndWait(new MarkAsReadCommand(notification.getAggregateId()));
        } else {
            // Notification creee avant l'integration Axon : pas d'agregat a cibler.
            notificationService.markAsReadLegacy(id);
        }
    }
}
