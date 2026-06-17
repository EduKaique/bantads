package com.bantads.auth;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertNotNull;

class AuthApplicationTests {

	@Test
	void deveCarregarClassePrincipal() {
		assertNotNull(AuthApplication.class);
	}

}
