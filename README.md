# Asisya Product API & Frontend SPA

Solución FullStack desarrollada para la prueba técnica de Asisya, orientada a la gestión de productos y categorías con capacidad de procesamiento e inserción masiva de datos (100,000+ registros), autenticación JWT y arquitectura limpia.

---

## 🏗️ Arquitectura y Criterios Técnicos

La solución está construida sobre **.NET Core** implementando **Clean Architecture** estructurada en 4 capas principales:

1. **Domain:** Entidades (`Product`, `Category`), interfaces base e inmutabilidad de reglas de negocio.
2. **Application:** Casos de uso, DTOs con mapeo explícito, validaciones y lógica de orquestación.
3. **Infrastructure:** Persistencia con Entity Framework Core, repositorios y configuraciones de Base de Datos.
4. **Api:** Controllers RESTful, middleware de manejo de errores globales y configuración de JWT.

### Backend Tech Stack:
- **Framework:** .NET 10 / C#
- **ORM:** Entity Framework Core
- **Database:** SQL Server
- **Seguridad:** JWT (JSON Web Tokens)
- **Pruebas:** xUnit, Moq, FluentAssertions

---

## ⚡ Estrategia de Carga Masiva y Rendimiento

Para soportar la inserción masiva de 100,000 productos sin agotar los recursos de memoria RAM ni congelar el servidor:
- **Batch Processing:** Inserción por lotes parametrizados (p. ej. 5,000 registros por bloque).
- **Optimización de ChangeTracker:** Desactivación temporal de `AutoDetectChangesEnabled` y desvinculación manual de entidades (`EntityState.Detached`) para prevenir saturación del rastreador de cambios de EF Core.
- **AsNoTracking:** Consulta de relaciones/categorías mediante listas no rastreadas.

---

## ☁️ Escalabilidad Horizontal en la Nube

Para escalar la solución en un entorno Cloud (AWS, Azure o GCP):

1. **Contenerización y Orquestación:**
   - Despliegue de los contenedores mediante **Kubernetes (EKS / AKS)** o **Azure Container Apps** configurando reglas de *Horizontal Pod Autoscaler* (HPA) basadas en uso de CPU / Memoria o métricas de tráfico.

2. **Load Balancer & API Gateway:**
   - Distribución del tráfico entrante entre Múltiples Replicas de la API mediante un **Application Load Balancer (ALB)** o NGINX Ingress Controller.

3. **Caché Distribuida:**
   - Implementación de **Redis Cluster** para almacenar en caché las consultas de lectura masiva de categorías y productos, reduciendo la carga sobre la base de datos.

4. **Base de Datos Escalable:**
   - Separación de lecturas/escrituras utilizando réplicas de lectura (*Read Replicas*) en Azure SQL Database o AWS RDS.

---

## 🚀 Instrucciones de Ejecución Local

### Opción 1: Con Docker Compose (Recomendado)

1. Clonar el repositorio:
   ```bash
   git clone <URL_DEL_REPOSIOTO>
   cd AsisyaProductApi