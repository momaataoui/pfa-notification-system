package com.pfa.rexel.notification.repository;

import com.pfa.rexel.notification.entity.DeliveryStatus;
import com.pfa.rexel.notification.entity.Notification;
import com.pfa.rexel.notification.entity.RecipientType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientEmailOrRecipientTypeOrderByCreatedAtDesc(String recipientEmail, RecipientType recipientType);

    List<Notification> findAllByOrderByCreatedAtDesc();

    List<Notification> findByDeliveryStatusOrderByCreatedAtDesc(DeliveryStatus status);

    List<Notification> findByCreatedAtAfter(LocalDateTime since);

    long countByDeliveryStatus(DeliveryStatus status);

    java.util.Optional<Notification> findByAggregateId(String aggregateId);
}
//Pourquoi cette méthode précise : pour GET /api/notifications/me, un USER doit voir ses notifications ciblées (recipientEmail = son email) ET les diffusions générales (recipientType = BROADCAST, peu importe l'email). Spring Data JPA génère automatiquement la requête SQL à partir du nom de la méthode (findBy...Or...) 