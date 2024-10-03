# SPDX-License-Identifier: Apache-2.0

ARG BUILD_IMAGE=node:20-bullseye
ARG RUN_IMAGE=gcr.io/distroless/nodejs20-debian11:nonroot

FROM ${BUILD_IMAGE} AS builder
LABEL stage=build
# TS -> JS stage

WORKDIR /home/app
COPY ./src ./src
COPY ./package*.json ./
COPY ./tsconfig.json ./
COPY .npmrc ./
ARG GH_TOKEN

RUN npm ci --ignore-scripts
RUN npm run build

FROM ${BUILD_IMAGE} AS dep-resolver
LABEL stage=pre-prod
# To filter out dev dependencies from final build

COPY package*.json ./
COPY .npmrc ./
ARG GH_TOKEN
RUN npm ci --omit=dev --ignore-scripts

FROM ${RUN_IMAGE} AS run-env
USER nonroot

WORKDIR /home/app
COPY --from=dep-resolver /node_modules ./node_modules
COPY --from=builder /home/app/build ./build
COPY package.json ./
COPY deployment.yaml ./
COPY service.yaml ./


# Turn down the verbosity to default level.
ENV NPM_CONFIG_LOGLEVEL info

ENV mode="http"
ENV upstream_url="http://127.0.0.1:3000"
ENV exec_timeout="10s"
ENV write_timeout="15s"
ENV read_timeout="15s"
ENV prefix_logs="false"
ENV MAX_CPU=

# Service-Based Environment Variables
ENV FUNCTION_NAME=transaction-aggregation-decisioning-processor
ENV NODE_ENV=production
ENV SERVER_URL=
ENV CMS_ENDPOINT=

ENV TRANSACTION_ROUTING_HOST=localhost
ENV TRANSACTION_ROUTING_PORT=3000
ENV TRANSACTION_ROUTING_PATH=result-test

# Redis
ENV REDIS_DATABASE=0
ENV REDIS_AUTH=
ENV REDIS_SERVERS=
ENV REDIS_IS_CLUSTER=

# Database
ENV TRANSACTION_HISTORY_DATABASE_CERT_PATH='/usr/local/share/ca-certificates/ca-certificates.crt'
ENV TRANSACTION_HISTORY_DATABASE_URL=
ENV TRANSACTION_HISTORY_DATABASE_USER='root'
ENV TRANSACTION_HISTORY_DATABASE_PASSWORD=
ENV TRANSACTION_HISTORY_DATABASE='transactionHistory'

ENV CONFIG_DATABASE_CERT_PATH='/usr/local/share/ca-certificates/ca-certificates.crt'
ENV CONFIG_DATABASE_URL=
ENV CONFIG_DATABASE_USER='root'
ENV CONFIG_DATABASE_PASSWORD=
ENV CONFIG_DATABASE='configuration'

ENV TRANSACTION_DATABASE_CERT_PATH='/usr/local/share/ca-certificates/ca-certificates.crt'
ENV TRANSACTION_DATABASE_URL=
ENV TRANSACTION_DATABASE_USER='root'
ENV TRANSACTION_DATABASE_PASSWORD=
ENV TRANSACTION_DATABASE='evaluationResults'

ENV CACHE_ENABLED=
ENV CACHETTL=30

# Alert
ENV SUPPRESS_ALERTS=false

# Apm
ENV APM_ACTIVE=true
ENV APM_URL=http://apm-server.development.svc.cluster.local:8200/
ENV APM_SECRET_TOKEN=

# Logstash
ENV LOGSTASH_HOST=logstash.development.svc.cluster.local
ENV LOGSTASH_PORT=8080
ENV LOGSTASH_LEVEL='info'

# Nats
ENV STARTUP_TYPE=nats
ENV SERVER_URL=0.0.0.0:4222
ENV PRODUCER_STREAM=
ENV ACK_POLICY=Explicit
ENV PRODUCER_STORAGE=File
ENV PRODUCER_RETENTION_POLICY=Workqueue
ENV SIDECAR_HOST=0.0.0.0:5000

# Set healthcheck command
HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1
EXPOSE 4222

# Execute watchdog command
CMD ["build/index.js"]
