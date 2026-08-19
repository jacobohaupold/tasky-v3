#!/usr/bin/env bash
# restore-remote-access.sh — Restaura el acceso remoto por terminal a tu ordenador
#
# IMPORTANTE: se ejecuta EN EL ORDENADOR AL QUE QUIERES ENTRAR (tu Mac),
# no desde una sesión en la nube. Ninguna sesión remota puede abrir por sí sola
# un túnel hacia tu máquina: el proceso tiene que nacer en la máquina.
#
# Uso:
#   bash scripts/restore-remote-access.sh              # = quick
#   bash scripts/restore-remote-access.sh quick        # terminal web temporal (sshx)
#   bash scripts/restore-remote-access.sh permanent    # SSH nativo + Tailscale (recomendado)
#   bash scripts/restore-remote-access.sh claude       # reactiva Claude Code Remote Control
#   bash scripts/restore-remote-access.sh status       # diagnóstico
#   bash scripts/restore-remote-access.sh stop         # cierra la terminal web temporal
#
# Atajo desde el Mac (repo público, no hace falta clonar):
#   curl -fsSL https://raw.githubusercontent.com/jacobohaupold/tasky-v3/claude/ssh-access-restore-tfaj4u/scripts/restore-remote-access.sh | bash -s -- quick

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m'

STATE_DIR="${HOME}/.local/state/tasky-remote"
SSHX_LOG="${STATE_DIR}/sshx.log"
SSHX_PID="${STATE_DIR}/sshx.pid"
SSHX_URL_FILE="${STATE_DIR}/sshx-url.txt"

info()  { echo -e "${BLUE}▸${NC} $*"; }
ok()    { echo -e "${GREEN}✓${NC} $*"; }
warn()  { echo -e "${YELLOW}!${NC} $*"; }
err()   { echo -e "${RED}✗${NC} $*" >&2; }
title() { echo; echo -e "${BOLD}$*${NC}"; echo; }

is_macos() { [ "$(uname -s)" = "Darwin" ]; }
have()     { command -v "$1" >/dev/null 2>&1; }

# Ruta del CLI de Tailscale (app de macOS o instalación por brew/pkg)
tailscale_bin() {
  if have tailscale; then command -v tailscale; return 0; fi
  local app="/Applications/Tailscale.app/Contents/MacOS/Tailscale"
  if [ -x "$app" ]; then echo "$app"; return 0; fi
  return 1
}

# ---------------------------------------------------------------------------
# quick — terminal web efímera vía sshx.io
# ---------------------------------------------------------------------------
cmd_quick() {
  title "Terminal web temporal (sshx)"

  cat <<'AVISO'
  Esto abre una terminal de este ordenador accesible desde el navegador.
  El enlace ES la credencial: quien lo tenga, entra. Trátalo como una contraseña,
  no lo pegues en sitios públicos y ciérralo al terminar con:
      bash scripts/restore-remote-access.sh stop

AVISO

  mkdir -p "$STATE_DIR"

  if ! have sshx; then
    info "sshx no está instalado. Instalando desde https://sshx.io/get ..."
    if ! curl -sSf https://sshx.io/get | sh; then
      err "No se pudo instalar sshx automáticamente."
      err "Instálalo a mano:  curl -sSf https://sshx.io/get | sh"
      return 1
    fi
    hash -r 2>/dev/null || true
  fi

  if ! have sshx; then
    # El instalador suele dejarlo en /usr/local/bin
    if [ -x /usr/local/bin/sshx ]; then
      export PATH="/usr/local/bin:$PATH"
    else
      err "sshx sigue sin aparecer en el PATH. Revisa la salida del instalador."
      return 1
    fi
  fi
  ok "sshx disponible: $(command -v sshx)"

  # Si ya hay una sesión viva, reutilízala en vez de abrir otra
  if [ -f "$SSHX_PID" ] && kill -0 "$(cat "$SSHX_PID")" 2>/dev/null; then
    warn "Ya había una sesión sshx corriendo (PID $(cat "$SSHX_PID"))."
    if [ -s "$SSHX_URL_FILE" ]; then
      print_url "$(cat "$SSHX_URL_FILE")"
      return 0
    fi
    info "No se guardó su URL; la cierro y abro una nueva."
    cmd_stop || true
  fi

  info "Arrancando sesión ..."
  : > "$SSHX_LOG"
  nohup sshx >>"$SSHX_LOG" 2>&1 &
  echo $! > "$SSHX_PID"
  disown 2>/dev/null || true

  # sshx tarda un instante en imprimir la URL
  local url="" i
  for i in $(seq 1 30); do
    url="$(grep -Eo 'https://sshx\.io/s/[^[:space:]]+' "$SSHX_LOG" 2>/dev/null | tail -n 1 || true)"
    [ -n "$url" ] && break
    if ! kill -0 "$(cat "$SSHX_PID")" 2>/dev/null; then
      err "sshx terminó inesperadamente. Log:"
      sed 's/^/    /' "$SSHX_LOG" >&2
      return 1
    fi
    sleep 1
  done

  if [ -z "$url" ]; then
    err "No se pudo leer la URL en 30 s. Log:"
    sed 's/^/    /' "$SSHX_LOG" >&2
    return 1
  fi

  printf '%s\n' "$url" > "$SSHX_URL_FILE"
  chmod 600 "$SSHX_URL_FILE" 2>/dev/null || true
  if have pbcopy; then printf '%s' "$url" | pbcopy && info "URL copiada al portapapeles."; fi
  print_url "$url"
}

print_url() {
  local url="$1"
  title "Tu terminal remota está lista"
  echo -e "    ${BOLD}${GREEN}${url}${NC}"
  echo
  echo "  · Ábrelo en el navegador del móvil y tienes la terminal del Mac."
  echo "  · Sobrevive a cerrar esta ventana, pero NO a reiniciar el ordenador."
  echo "  · Cerrar la sesión:  bash scripts/restore-remote-access.sh stop"
  echo "  · Guardada en:       $SSHX_URL_FILE"
  echo
  warn "Enlace efímero: si se reinicia el equipo tendrás que generar otro."
  warn "Para algo estable usa:  bash scripts/restore-remote-access.sh permanent"
}

cmd_stop() {
  if [ -f "$SSHX_PID" ] && kill -0 "$(cat "$SSHX_PID")" 2>/dev/null; then
    kill "$(cat "$SSHX_PID")" 2>/dev/null || true
    sleep 1
    kill -9 "$(cat "$SSHX_PID")" 2>/dev/null || true
    ok "Sesión sshx cerrada."
  else
    info "No había ninguna sesión sshx viva registrada."
    if pkill -f '(^|/)sshx( |$)' 2>/dev/null; then ok "Procesos sshx sueltos terminados."; fi
  fi
  rm -f "$SSHX_PID" "$SSHX_URL_FILE"
}

# ---------------------------------------------------------------------------
# permanent — SSH nativo de macOS + Tailscale (dirección estable, red privada)
# ---------------------------------------------------------------------------
cmd_permanent() {
  title "Acceso permanente: SSH nativo + Tailscale"

  if ! is_macos; then
    warn "Este modo está escrito para macOS. En Linux: habilita sshd e instala Tailscale a mano."
  fi

  # 1) Remote Login (servidor SSH del sistema)
  if is_macos; then
    info "Activando Sesión remota (SSH) ..."
    if sudo systemsetup -setremotelogin on 2>/dev/null; then
      ok "Sesión remota activada."
    else
      warn "No se pudo activar por comando (macOS lo restringe sin Acceso Total al Disco)."
      warn "Actívalo a mano: Ajustes del Sistema → General → Compartir → Sesión remota (ON)"
    fi
  fi

  # 2) Tailscale: hostname estable, sin abrir puertos al exterior
  local ts=""
  if ! ts="$(tailscale_bin)"; then
    info "Tailscale no está instalado."
    if have brew; then
      info "Instalando con Homebrew ..."
      brew install --cask tailscale || warn "Falló brew; instálalo desde https://tailscale.com/download"
    else
      warn "Sin Homebrew. Descárgalo de https://tailscale.com/download y repite este modo."
    fi
    ts="$(tailscale_bin || true)"
  fi

  if [ -n "${ts:-}" ] && [ -x "$ts" ]; then
    ok "Tailscale disponible: $ts"
    info "Conectando el equipo a tu tailnet (te pedirá login en el navegador) ..."
    "$ts" up --ssh || warn "Revisa la salida de 'tailscale up --ssh'."
    echo
    "$ts" status 2>/dev/null | head -5 || true
  fi

  title "Cómo entrar desde el móvil"
  echo "  1. Instala Tailscale en el iPhone/Android y entra con la MISMA cuenta."
  echo "  2. Instala un cliente SSH (Termius, Blink, ShellFish...)."
  echo "  3. Conecta a:   ${USER:-usuario}@$(hostname -s 2>/dev/null || echo mac-mini)"
  echo
  echo "  Ventaja: la dirección no caduca nunca y no expone nada a internet"
  echo "  público — solo tus propios dispositivos ven la máquina."
}

# ---------------------------------------------------------------------------
# claude — reactivar Claude Code Remote Control
# ---------------------------------------------------------------------------
cmd_claude() {
  title "Claude Code Remote Control"

  if ! have claude; then
    err "El CLI 'claude' no está en este equipo."
    echo "  Instálalo desde https://claude.com/claude-code y repite."
    return 1
  fi
  ok "claude $(claude --version 2>/dev/null | head -1)"

  echo
  echo "  Arranca la sesión puenteada con:"
  echo
  echo -e "      ${BOLD}claude --remote-control \"Mac mini\"${NC}"
  echo
  echo "  Deja esa ventana ABIERTA. Mientras siga abierta, la sesión aparece en"
  echo "  claude.ai/code desde el móvil y puedes dar órdenes a este ordenador."
  echo "  Al cerrarla, la sesión pasa a 'disconnected' y deja de responder."
}

# ---------------------------------------------------------------------------
# status — diagnóstico
# ---------------------------------------------------------------------------
cmd_status() {
  title "Estado del acceso remoto"

  echo "  Equipo:   $(hostname -s 2>/dev/null || echo '?')  ($(uname -s) $(uname -r))"
  echo "  Usuario:  ${USER:-$(id -un)}"
  local ip
  ip="$(ipconfig getifaddr en0 2>/dev/null || hostname -I 2>/dev/null | awk '{print $1}' || echo '?')"
  echo "  IP local: ${ip:-?}"
  echo

  # SSH del sistema
  if nc -z -G 2 localhost 22 >/dev/null 2>&1 || nc -z -w 2 localhost 22 >/dev/null 2>&1; then
    ok "Servidor SSH escuchando en el puerto 22"
  else
    warn "Puerto 22 cerrado — la Sesión remota parece desactivada"
  fi

  # sshx
  if have sshx; then
    if [ -f "$SSHX_PID" ] && kill -0 "$(cat "$SSHX_PID")" 2>/dev/null; then
      ok "sshx corriendo (PID $(cat "$SSHX_PID"))"
      if [ -s "$SSHX_URL_FILE" ]; then echo "     URL: $(cat "$SSHX_URL_FILE")"; fi
    else
      warn "sshx instalado pero sin sesión activa"
    fi
  else
    warn "sshx no instalado"
  fi

  # Tailscale
  local ts=""
  if ts="$(tailscale_bin)"; then
    if "$ts" status >/dev/null 2>&1; then
      ok "Tailscale conectado"
      "$ts" status 2>/dev/null | head -3 | sed 's/^/     /'
    else
      warn "Tailscale instalado pero desconectado (ejecuta: $ts up --ssh)"
    fi
  else
    warn "Tailscale no instalado"
  fi

  # Claude Code
  if have claude; then
    ok "claude $(claude --version 2>/dev/null | head -1)"
    if pgrep -f 'claude .*--remote-control' >/dev/null 2>&1; then
      ok "Sesión Remote Control activa"
    else
      warn "Sin sesión Remote Control activa"
    fi
  else
    warn "CLI 'claude' no instalado"
  fi
  echo
}

# Imprime la cabecera de documentación (las líneas de comentario tras el shebang)
usage() { awk 'NR>1 { if (/^#/) { sub(/^# ?/, ""); print } else { exit } }' "$0"; }

main() {
  case "${1:-quick}" in
    quick|sshx|web)        cmd_quick ;;
    permanent|perm|ssh)    cmd_permanent ;;
    claude|rc)             cmd_claude ;;
    status|check|doctor)   cmd_status ;;
    stop|kill)             cmd_stop ;;
    -h|--help|help)        usage ;;
    *) err "Modo desconocido: $1"; usage; exit 1 ;;
  esac
}

main "$@"
