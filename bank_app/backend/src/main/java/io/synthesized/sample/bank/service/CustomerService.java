package io.synthesized.sample.bank.service;

import io.synthesized.sample.bank.model.Customer;
import io.synthesized.sample.bank.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Autowired
    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Map<String, Object> getCustomers(String database, int page, int size, String sortBy, String sortOrder,
                                          String customerType, String searchQuery) {
        List<Customer> customers = customerRepository.findAll(database, page, size, sortBy, sortOrder, customerType, searchQuery, null);
        int totalCount = customerRepository.count(database, customerType, searchQuery, null);
        
        Map<String, Object> result = new HashMap<>();
        result.put("customers", customers);
        result.put("totalCount", totalCount);
        return result;
    }

    public Customer getCustomer(String database, Long customerId) {
        return customerRepository.findById(database, customerId);
    }

    public Customer createCustomer(String database, Customer customer) {
        return customerRepository.create(database, customer);
    }

    public List<Customer> getCustomers(String database, int page, int size, String sortBy, String sortOrder,
                                     String customerType, String searchQuery, String customerId) {
        return customerRepository.findAll(database, page, size, sortBy, sortOrder, customerType, searchQuery, customerId);
    }

    public int count(String database, String customerType, String searchQuery, String customerId) {
        return customerRepository.count(database, customerType, searchQuery, customerId);
    }

    public Customer getCustomerById(String database, Long customerId) {
        return customerRepository.findById(database, customerId);
    }

    public void deleteCustomer(String database, Long customerId) {
        customerRepository.deleteById(database, customerId);
    }
} 