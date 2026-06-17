local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
vim.opt.rtp:prepend(lazypath)
vim.g.mapleader = " "
require("lazy").setup({
    { import = "plugins" },
    { import = "themes" }
})
require("config")
