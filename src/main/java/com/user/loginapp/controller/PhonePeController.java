package com.user.loginapp.controller;

import com.user.loginapp.service.PhonePeService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class PhonePeController {

    private final PhonePeService phonePeService;

    @Value("${payment.merchant.upi:merchant@upi}")
    private String merchantUpi;

    public PhonePeController(PhonePeService phonePeService) {
        this.phonePeService = phonePeService;
    }

    // Client calls to create an order. In real PhonePe flow, server should call their API and return payment token.
    @PostMapping("/api/payments/phonepe/create-order")
    public ResponseEntity<Map<String, Object>> createOrder(@RequestBody Map<String, Object> body) {
        String orderId = String.valueOf(body.getOrDefault("orderId", "pp-" + System.currentTimeMillis()));
        String amount = String.valueOf(body.getOrDefault("amount", "0"));
        String name = String.valueOf(body.getOrDefault("name", "Shaurya Store"));

        Map<String, Object> order = phonePeService.buildOrder(orderId, amount, name);
        // For demo, also provide a UPI deep link that PhonePe can handle (client may open this link on mobile)
        String upiLink = String.format("upi://pay?pa=%s&pn=%s&am=%s&cu=INR", merchantUpi, name.replace(" ", "%20"), amount);
        order.put("paymentUrl", upiLink);
        order.put("orderId", orderId);
        return ResponseEntity.ok(order);
    }

    // Webhook endpoint that PhonePe would call. For demo we accept POST and verify signature if provided.
    @PostMapping("/api/payments/phonepe/webhook")
    public ResponseEntity<Map<String, Object>> webhook(@RequestBody Map<String, Object> body,
                                                       @RequestHeader(value = "X-Signature", required = false) String signature) {
        Map<String, Object> resp = new HashMap<>();
        // Convert incoming payload to string to verify signature — in production use canonicalization per PhonePe docs
        String payloadStr = body.toString();
        boolean ok = true;
        if (signature != null) {
            ok = phonePeService.verifySignature(payloadStr, signature);
        }
        resp.put("verified", ok);
        resp.put("received", body);
        // Here you would update order status in DB using order id from payload
        return ResponseEntity.ok(resp);
    }

    // Simple verify endpoint for client-driven confirmation (demo only)
    @PostMapping("/api/payments/phonepe/verify")
    public ResponseEntity<Map<String, Object>> verifyPayment(@RequestBody Map<String, Object> body) {
        String orderId = String.valueOf(body.getOrDefault("orderId", ""));
        Map<String, Object> resp = new HashMap<>();
        // In production, call PhonePe/order API to verify transaction.
        resp.put("orderId", orderId);
        resp.put("status", "SUCCESS");
        resp.put("message", "Simulated PhonePe verification: payment marked as successful (demo)");
        return ResponseEntity.ok(resp);
    }
}
