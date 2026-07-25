package com.pfa.rexel.notification.controller;

import com.pfa.rexel.notification.dto.AdminNotificationCreateRequest;
import com.pfa.rexel.notification.entity.Notification;
import com.pfa.rexel.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/notifications")
@RequiredArgsConstructor
public class AdminNotificationController {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Notification> create(@Valid @RequestBody AdminNotificationCreateRequest request) {
        Notification notification = notificationService.createManual(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(notification);
    }
}
