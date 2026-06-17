return {
    "nvim-telescope/telescope.nvim",
    dependencies = {
        "nvim-lua/plenary.nvim"
    },
    config = function()
        builtin = require("telescope.builtin")
    end
}
