package com.pfa.rexel.store.exception;

public class InsufficientStockException extends RuntimeException {

    public InsufficientStockException(Long productId) {
        super("Stock insuffisant");
    }
}
