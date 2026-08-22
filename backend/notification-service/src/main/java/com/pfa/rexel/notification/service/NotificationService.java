package com.pfa.rexel.notification.service;

import com.pfa.rexel.notification.dto.NotificationStatsResponse;
import com.pfa.rexel.notification.entity.Channel;
import com.pfa.rexel.notification.entity.DeliveryStatus;
import com.pfa.rexel.notification.entity.Notification;
import com.pfa.rexel.notification.entity.RecipientType;
import com.pfa.rexel.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

// Depuis l'integration Axon (voir package cqrs), ce service ne gere plus les
// ECRITURES (creation, marquage lu) : c'est desormais le role de
// NotificationAggregate (regles metier) + NotificationProjection (persistence
// de la table de lecture). NotificationService reste uniquement le cote QUERY
// du CQRS : consultation de la projection, jamais de decision.
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public List<Notification> findForUser(String email) {
        return notificationRepository.findByRecipientEmailOrRecipientTypeOrderByCreatedAtDesc(email, RecipientType.BROADCAST);
    }

    public List<Notification> findAll() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Notification> findByDeliveryStatus(DeliveryStatus status) {
        return notificationRepository.findByDeliveryStatusOrderByCreatedAtDesc(status);
    }

    public Optional<Notification> findByAggregateId(String aggregateId) {
        return notificationRepository.findByAggregateId(aggregateId);
    }

    public Notification findById(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Notification introuvable: " + id));
    }

    // Filet de securite pour les notifications creees AVANT l'integration Axon
    // (aggregateId null) : elles ne peuvent pas etre ciblees par une commande,
    // donc on les marque lues directement, comme avant.
    public void markAsReadLegacy(Long id) {
        Notification notification = findById(id);
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public NotificationStatsResponse getStats() {
        List<Notification> all = notificationRepository.findAll();

        Map<String, Long> channelCounts = new HashMap<>();
        for (Channel channel : Channel.values()) {
            channelCounts.put(channel.name(), 0L);
        }
        for (Notification n : all) {
            for (Channel channel : n.getChannels()) {
                channelCounts.merge(channel.name(), 1L, Long::sum);
            }
        }

        LocalDateTime since = LocalDate.now().minusDays(6).atStartOfDay();
        List<Notification> recent = notificationRepository.findByCreatedAtAfter(since);
        DateTimeFormatter dayFormat = DateTimeFormatter.ofPattern("dd/MM");

        List<NotificationStatsResponse.DailyChannelCount> timeline = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate day = LocalDate.now().minusDays(i);
            long push = 0;
            long email = 0;
            long sms = 0;
            for (Notification n : recent) {
                if (!n.getCreatedAt().toLocalDate().equals(day)) {
                    continue;
                }
                if (n.getChannels().contains(Channel.PUSH)) {
                    push++;
                }
                if (n.getChannels().contains(Channel.EMAIL)) {
                    email++;
                }
                if (n.getChannels().contains(Channel.SMS)) {
                    sms++;
                }
            }
            timeline.add(new NotificationStatsResponse.DailyChannelCount(day.format(dayFormat), push, email, sms));
        }

        NotificationStatsResponse.DeliveryBreakdown delivery = new NotificationStatsResponse.DeliveryBreakdown(
                notificationRepository.countByDeliveryStatus(DeliveryStatus.DELIVERED),
                notificationRepository.countByDeliveryStatus(DeliveryStatus.FAILED),
                notificationRepository.countByDeliveryStatus(DeliveryStatus.PENDING)
        );

        return new NotificationStatsResponse(all.size(), channelCounts, timeline, delivery);
    }
}
