#ifndef GITHUBOTA_COMMON_H
#define GITHUBOTA_COMMON_H

#include "semver.h"
#include <HTTPClient.h>
#include <HTTPUpdate.h>
#include <Update.h>
#include <WiFiClient.h>
#include <WiFiClientSecure.h>

using Updater = HTTPUpdate;

// Takes the base WiFiClient type (WiFiClientSecure derives from it) so callers can pass either
// a plain WiFiClient (http:// release URLs, e.g. an unencrypted self-hosted Gitea) or a
// WiFiClientSecure (https://) through the same helpers. Passing a WiFiClientSecure for an
// http:// URL forces a TLS handshake against a plaintext server and fails with
// "SSL - An invalid SSL record was received" — the caller must select the client that matches
// the URL's scheme.
String get_updated_base_url_via_redirect(WiFiClient &wifi_client, String &release_url);
String get_redirect_location(WiFiClient &wifi_client, String &initial_url);
String get_updated_version_via_txt_file(WiFiClient &wifi_client, String &_release_url);

void print_update_result(Updater updater, HTTPUpdateResult result, const char *TAG);

bool update_required(semver_t _new_version, semver_t _current_version);

void update_started();
void update_finished();
void update_error(int err);

#endif