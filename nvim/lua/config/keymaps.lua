vim.keymap.set(
    "n",
    "<leader>ff",
    builtin.find_files,
    { desc = "Find Files" }
)
vim.keymap.set(
    "n",
    "<leader>fg",
    builtin.live_grep,
    { desc = "Live Grep" }
)
vim.keymap.set(
    "n",
    "<leader>fb",
    builtin.buffers,
    { desc = "Buffers" }
)
vim.keymap.set(
    "n",
    "<leader>fh",
    builtin.help_tags,
    { desc = "Help Tags" }
)
vim.keymap.set(
    "n",
    "<leader>e",
    ":Neotree toggle<CR>",
    { desc = "Explorer" }
)
vim.keymap.set(
    "n",
    "<S-l>",
    "<Cmd>BufferLineCycleNext<CR>"
)
vim.keymap.set(
    "n",
    "<S-h>",
    "<Cmd>BufferLineCyclePrev<CR>"
)
vim.keymap.set(
    "n",
    "<leader>bd",
    ":bd<CR>",
    { desc = "Delete Buffer" }
)
vim.keymap.set(
    "n",
    "<leader>bn",
    ":enew<CR>",
    { desc = "New Buffer" }
)
vim.keymap.set(
    "n",
    "<leader>bs",
    ":w<CR>",
    { desc = "Save Buffer" }
)
vim.keymap.set(
    "n",
    "<leader>do",
    function()
        require("dapui").open()
    end,
    { desc = "Debug: Open" }
)
vim.keymap.set(
    "n",
    "<leader>ds",
    function()
        require("dap").continue()
    end,
    { desc = "Debug: Start" }
)
vim.keymap.set(
    "n",
    "<leader>dc",
    function()
        require("dapui").close()
    end,
    { desc = "Debug: Close" }
)
vim.keymap.set(
    "n",
    "<leader>dq",
    function()
        require("dap").terminate()
    end,
    { desc = "Debug: Quit" }
)
vim.keymap.set(
    "n",
    "<leader>dt",
    function()
        require("dap").toggle_breakpoint()
    end,
    { desc = "Debug: Toggle Breakpoint" }
)
vim.keymap.set(
    "n",
    "<leader>dn",
    function()
        require("dap").step_over()
    end,
    { desc = "Debug: Next (Step Over)" }
)
vim.keymap.set(
    "n",
    "<leader>di",
    function()
        require("dap").step_into()
    end,
    { desc = "Debug: Step Into" }
)
vim.keymap.set(
    "n",
    "<leader>du",
    function()
        require("dap").step_out()
    end,
    { desc = "Debug: Step Out" }
)

vim.keymap.set(
    "n",
    "<leader>dh",
    function()
        require("dap.ui.widgets").hover()
    end,
    { desc = "Debug: Hover" }
)
vim.keymap.set(
    "n",
    "<leader>dr",
    function()
        require("dap").repl.open()
    end,
    { desc = "Debug: REPL" }
)
vim.keymap.set(
    "n",
    "<leader>t1",
    "<cmd>ToggleTerm 1<CR>",
    { desc = "Terminal 1" }
)
vim.keymap.set(
    "n",
    "<leader>t2",
    "<cmd>ToggleTerm 2<CR>",
    { desc = "Terminal 2" }
)
vim.keymap.set(
    "n",
    "<leader>t3",
    "<cmd>ToggleTerm 3<CR>",
    { desc = "Terminal 3" }
)
vim.keymap.set(
    "t",
    "<Esc>",
    [[<C-\><C-n>]]
)
vim.keymap.set(
    "n",
    "<leader>le",
    vim.diagnostic.open_float,
    { desc = "Line Diagnostics" }
)
vim.keymap.set(
    "n",
    "<leader>ld",
    vim.diagnostic.setloclist,
    { desc = "Diagnostics List" }
)
vim.keymap.set(
    "n",
    "<leader>fd",
    "<cmd>Telescope diagnostics<CR>",
    { desc = "Find Diagnostics" }
)
vim.keymap.set(
    "n",
    "<C-Up>",
    ":resize +2<CR>"
)
vim.keymap.set(
    "n",
    "<C-Down>",
    ":resize -2<CR>"
)
vim.keymap.set(
    "n",
    "<C-Left>",
    ":vertical resize +2<CR>"
)
vim.keymap.set(
    "n",
    "<C-Right>",
    ":vertical resize -2<CR>"
)
