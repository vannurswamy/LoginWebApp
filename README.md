# LoginWebApp

This repository contains a minimal login and registration demo:

- Java (Spring Boot) backend (REST API)
- Oracle database (users table)
- Simple static frontend (HTML + JavaScript) served from Spring Boot's static resources

This skeleton is intended to be run locally against an Oracle database. The project uses Spring Data JPA and will create/update the schema if configured.

## Files added

- `pom.xml` — Maven build, dependencies
- `src/main/java/com/example/loginapp` — Java source (controller, service, entity, repository, DTOs)
- `src/main/resources/application.properties` — Oracle datasource placeholders
- `src/main/resources/schema.sql` — SQL to create `USERS` table in Oracle (optional)
- `src/main/resources/static/index.html` and `app.js` — simple frontend

## Quick start (Windows / cmd.exe)

1. Edit `src/main/resources/application.properties` and set your Oracle connection details:

	- `spring.datasource.url` (example: `jdbc:oracle:thin:@localhost:1521:XE`)
	- `spring.datasource.username`
	- `spring.datasource.password`

	If your Oracle JDBC driver isn't available from your Maven setup, install `ojdbc` into your local Maven repository or configure Oracle's Maven repository as needed.

2. (Optional) Run the SQL in `src/main/resources/schema.sql` against your Oracle DB to create the `USERS` table.

3. Build with Maven:

```
mvn clean package -DskipTests
```

4. Run the jar:

```
java -jar target/loginapp-0.0.1-SNAPSHOT.jar
```

5. Open the frontend in your browser:

	http://localhost:8080/

	Use the Register form to create a user, then Login.

## Notes and next steps

- Passwords are hashed using BCrypt.
- This example is intentionally minimal and does not include JWT/session management or CSRF protection. For production, add authentication tokens, HTTPS, input validation, and stricter security settings.
- If you want automated tests or CI, I can add basic unit tests and a simple Docker compose file for an Oracle container (if you prefer an alternative like Oracle XE image), or switch DB to H2 for easier local dev.

