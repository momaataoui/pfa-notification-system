package com.pfa.rexel.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationStatsResponse {

    private long totalSent;
    private Map<String, Long> channelCounts;
    private List<DailyChannelCount> timeline;
    private DeliveryBreakdown delivery;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DailyChannelCount {
        private String date;
        private long push;
        private long email;
        private long sms;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DeliveryBreakdown {
        private long delivered;
        private long failed;
        private long pending;
    }
}
