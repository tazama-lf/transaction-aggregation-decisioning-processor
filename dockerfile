FROM --platform=${TARGETPLATFORM:-linux/amd64} ghcr.io/openfaas/of-watchdog:0.8.4 as watchdog
FROM --platform=${TARGETPLATFORM:-linux/amd64} node:14-alpine as ship

ARG TARGETPLATFORM
ARG BUILDPLATFORM

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog

RUN addgroup -S app && adduser -S -g app app

RUN apk --no-cache add curl ca-certificates

# Turn down the verbosity to default level.
ENV NPM_CONFIG_LOGLEVEL warn

# Create a folder named function
RUN mkdir -p /home/app

# Wrapper/boot-strapper
WORKDIR /home/app

COPY ./package.json ./
COPY ./package-lock.json ./
COPY ./tsconfig.json ./

# Install dependencies
RUN npm install

COPY ./src ./src

# Build the project
RUN npm run build

# Environment variables for openfaas
ENV cgi_headers="true"
ENV fprocess="node ./build/index.js"
ENV mode="http"
ENV upstream_url="http://127.0.0.1:3000"

ENV exec_timeout="10s"
ENV write_timeout="15s"
ENV read_timeout="15s"

ENV prefix_logs="false"

# Service-Based Enviroment Variables
ENV FUNCTION_NAME=transaction-aggregation-decisioning-processor
ENV NODE_ENV=production
ENV PORT=3000
ENV REDIS_DB=0
ENV REDIS_AUTH=utiYxjU3gK
ENV REDIS_HOST=20.108.120.33
ENV REDIS_PORT=6379
ENV DATABASE_NAME=Configuration
ENV DATABASE_URL=http://arango.development:8529
ENV DATABASE_USER=root
ENV DATABASE_PASSWORD='$!prAtHe>Qh5X9D3'
ENV COLLECTION_NAME=history
ENV GRAPH_NAME=FCA
ENV APM_ACTIVE=true
ENV APM_SERVICE_NAME=transaction-agreggation-decisioning-processor
ENV APM_URL=http://apm-server.development:8200
ENV APM_SECRET_TOKEN=eyJhbGciOiJSUzI1NiIsImtpZCI6ImtxNjhyU0hZbmtUTk5lbGJNVnU1QmNVTG1jQnJsanBCbU1QYW1zTHZSdEkifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZXZlbG9wbWVudCIsImt1YmVybmV0ZXMuaW8vc2VydmljZWFjY291bnQvc2VjcmV0Lm5hbWUiOiJkZWZhdWx0LXRva2VuLTdoc3ZzIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImRlZmF1bHQiLCJrdWJlcm5ldGVzLmlvL3NlcnZpY2VhY2NvdW50L3NlcnZpY2UtYWNjb3VudC51aWQiOiIyMmNjOWJkYi03MTYyLTQ4NzktYWU3Yi0xZDU2ZDI2OTNhMTQiLCJzdWIiOiJzeXN0ZW06c2VydmljZWFjY291bnQ6ZGV2ZWxvcG1lbnQ6ZGVmYXVsdCJ9.AkJrvBkc58bozYRTclk3QQy6j7ra8DsD7CVPN3PhaVucqLOjVJKKb2SvhHElQU5B9e2RumYeuthlOtPHFLuoo1GyvXPjDfv7lIBxQ4-uVEY7bSceYpGG87bXRqoVVKzfKlaNWguAK0cpLyFjyAV8HykrAjgDSGaD8_xzYg6FVPWI6B5W_5ZQnGPleQZOFVajJu6sOHoVW_7o1Rn0VT3GVI-dCGHyIPIFx7rrsukGMN0MPtbrG64U3Y9nGtqzSK275rIE-kmQ36GFD2Ly3hdPRHEhOYf0pja2OdP9zaBnVTfXYUAYhmGcAqgtDvxmDIOXuEB0RPu7BuR1SGtrFEb6SZZSf-MZoMSiI06cv5z3GyZc0YQxilyU5_8rblByz5v1nQqTYpPQEuzv9f_llsxL7m3lUrTGJVdUnKHedPrGE7z2KwEQaate4o6BNBSyWIt_gXAoV_y_k-ZXGj7hJ6pjuE2uI__-HIEeqhpcpuiF17Fk8jUMNsvboNBUds_qPjGMIDj-2lcIdOkwc1TamCXrWa3inKEgJ_mOa2QU64-vP3mFYHi1WO8LrH_cqq67ZVC2wlsQFyEHgreyWX9L_LJculIz0hX9Jo3ssKuE-7JJVd_F1ByGAQnbTDlXHQjnmpvE3-xKp5YIQ9bRpxe9082HdABB5-tPf8ChLOFW0xLzCpw
ENV LOGSTASH_HOST=logstash.development
ENV LOGSTASH_PORT=8080


HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1

# Execute watchdog command
CMD ["fwatchdog"]
