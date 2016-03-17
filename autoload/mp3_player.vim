let s:true = !0
let s:false = 0

function! s:init(...) abort
  let g:mp3_player_autoloaded = s:true
  let a:args = ''
  let s:default_directory = expand('~/Music')
  if a:0 == 0
    let s:args = get(g:, 'playlist_directory', s:default_directory)
  else
    let s:args = expand(a:000[0])
  endif
  let s:args = expand(s:args)
  if s:args != ''
    call rpcnotify(0, 'mp3-player:init', s:args)
  endif
endfunction

if !get(g:, 'mp3_player_autoloaded', s:false)
  call s:init()
endif

function! mp3_player#init(...) abort
  if a:0 > 1
    let s:index = 0
    while a:0 > s:index
      let s:args .= '\ ' .  a:000[s:index]
      let s:index += 1
    endwhile
    call s:init(s:args)
  elseif a:0 == 1
    call s:init(a:1)
  else
    call s:init()
  endif
endfunction

function! mp3_player#toggle() abort
  if g:mp3_player#window_state == s:true
    call mp3_player#close()
  else
    call mp3_player#open()
  endif
endfunction

function! mp3_player#open() abort
  let g:mp3_player#window_state = s:true
  call rpcnotify(0, 'mp3-player:open')
endfunction

function! mp3_player#close() abort
  let g:mp3_player#window_state = s:false
  call rpcnotify(0, 'mp3-player:close')
endfunction

function! mp3_player#play() abort
  call rpcnotify(0, 'mp3-player:play')
endfunction

function! mp3_player#stop() abort
  call rpcnotify(0, 'mp3-player:stop')
endfunction

function! mp3_player#next() abort
  call rpcnotify(0, 'mp3-player:next')
endfunction

function! mp3_player#prev() abort
  call rpcnotify(0, 'mp3-player:prev')
endfunction

