{{- define "bank-demo.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end }}

{{- define "bank-demo.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- include "bank-demo.name" . -}}
{{- end -}}
{{- end }}

{{- define "bank-demo.labels" -}}
app.kubernetes.io/name: {{ include "bank-demo.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end }}

{{- define "bank-demo.selectorLabels" -}}
app.kubernetes.io/name: {{ include "bank-demo.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{- define "bank-demo.externalHost" -}}
{{- printf "%s-%s.%s" (required "external.hostnamePrefix is required when using external JDBC URLs" .Values.external.hostnamePrefix) .Release.Namespace (required "dbExposure.domain is required when using external JDBC URLs" .Values.dbExposure.domain) -}}
{{- end }}

{{- define "bank-demo.connectionHost" -}}
{{/* Must match the condition that guards the LoadBalancer in service-external.yaml.
     That Service carries the external-dns hostname annotation, so it is the only
     thing that publishes externalHost. Keying this off dbExposure.domain instead
     handed the backend a hostname that never resolved whenever exposure was off. */}}
{{- if and .Values.dbExposure.enabled .Values.external.enabled -}}
{{- include "bank-demo.externalHost" . -}}
{{- else -}}
{{- include "bank-demo.fullname" . -}}
{{- end -}}
{{- end }}

{{- define "bank-demo.connectionPort" -}}
{{/* Same condition as connectionHost. dbExposure.port is the port the
     LoadBalancer in service-external.yaml listens on, service.port the one the
     ClusterIP in service.yaml listens on. Both default to 5432, so a mismatch
     only appears once someone changes one of them. */}}
{{- if and .Values.dbExposure.enabled .Values.external.enabled -}}
{{- .Values.dbExposure.port -}}
{{- else -}}
{{- .Values.service.port -}}
{{- end -}}
{{- end }}

{{- define "bank-demo.sslMode" -}}
{{- if .Values.database.sslMode -}}
{{- .Values.database.sslMode -}}
{{- else -}}
{{- if .Values.ssl.enabled -}}
require
{{- else -}}
disable
{{- end -}}
{{- end }}
{{- end }}
