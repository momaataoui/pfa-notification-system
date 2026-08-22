package com.pfa.rexel.store.event;

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
