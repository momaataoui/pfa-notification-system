package com.pfa.rexel.store.exception;

public class ProductRequestNotFoundException extends RuntimeException {

    public ProductRequestNotFoundException(Long id) {
        super("Product request not found: " + id);
    }
}
