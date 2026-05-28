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
{{- printf "%s-%s.%s" .Values.external.hostnamePrefix .Release.Namespace (required "dbExposure.domain is required when dbExposure.enabled=true" .Values.dbExposure.domain) -}}
{{- end }}

{{- define "bank-demo.connectionHost" -}}
{{- if and .Values.dbExposure.enabled .Values.external.enabled -}}
{{- include "bank-demo.externalHost" . -}}
{{- else -}}
{{- include "bank-demo.fullname" . -}}
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
