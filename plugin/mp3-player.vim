if get(g:, 'loaded_mp3_player', 0) || !exists('g:nyaovim_version')
  finish
end

let g:mp3_player#window_state = 0

let s:default_directory = expand('~/Music')

let g:playlist_directory =
    \  get(g:, 'playlist_directory', s:default_directory)

command! -nargs=* MP3PLayerInit call mp3_player#init(<args>)
command! -nargs=0 MP3PlayerToggle call mp3_player#toggle()
command! -nargs=0 MP3PlayerOpen call mp3_player#open()
command! -nargs=0 MP3PlayerClose call mp3_player#close()
command! -nargs=0 MP3PlayerPlay call mp3_player#play()
command! -nargs=0 MP3PlayerStop call mp3_player#stop()
command! -nargs=0 MP3PlayerNext call mp3_player#next()
command! -nargs=0 MP3PlayerPrev call mp3_player#prev()

nnoremap <Plug>(mp3_player#toggle) :<C-u>MP3PlayerToggle<CR>

let g:loaded_mp3_player = 1
