package com.bantads.cliente;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class ClienteApplicationTests {

	@Test
	void deveCarregarClassePrincipal() {
		assertNotNull(ClienteApplication.class);
	}

}
