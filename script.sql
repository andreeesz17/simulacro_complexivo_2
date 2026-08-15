CREATE USER aereopuertos_user WITH PASSWORD 'admin123';
CREATE DATABASE aereopuertos_db OWNER aereopuertos_user;

\c aereopuertos_db

ALTER SCHEMA public OWNER TO aereopuertos_user;
GRANT ALL ON SCHEMA public TO aereopuertos_user;
GRANT CREATE ON SCHEMA public TO aereopuertos_user;

ALTER DEFAULT PRIVILEGES FOR USER aereopuertos_user IN SCHEMA public
GRANT ALL ON TABLES TO aereopuertos_user;

ALTER DEFAULT PRIVILEGES FOR USER aereopuertos_user IN SCHEMA public
GRANT ALL ON SEQUENCES TO aereopuertos_user;

ALTER DEFAULT PRIVILEGES FOR USER aereopuertos_user IN SCHEMA public
GRANT ALL ON FUNCTIONS TO aereopuertos_user;
