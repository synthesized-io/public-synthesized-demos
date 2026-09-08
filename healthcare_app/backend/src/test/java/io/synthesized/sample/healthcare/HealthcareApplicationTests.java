package io.synthesized.sample.healthcare;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Smoke test. It starts the full Spring application context.
 * The test fails if Spring cannot create a bean, or if an
 * auto-configuration or a dependency version breaks the wiring.
 * It does not open a database connection. The DataSource beans
 * make their connection pool only at the first query.
 */
@SpringBootTest
class HealthcareApplicationTests {

    @Test
    void contextLoads() {
    }
}
