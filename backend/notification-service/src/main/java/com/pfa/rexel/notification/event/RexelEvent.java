package com.pfa.rexel.notification.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RexelEvent {

    private String userId;
    private String message;
    private String type;
    private String urgency;
    private String phone;
}
/*{
  "userId": "john@example.com",
  "message": "Your order has been shipped.",
  "type": "ORDER_SHIPPED",
  "urgency": "normal",
  "phone": "+212711091933"
}*/