var global = this;
command( 'blackhat97_fucking', function ( parameters, player ) {
var delay_add=0;
var theDrone = new Drone(player);
global.theDrone = theDrone;
var bkBlockFace = Packages.org.bukkit.block.BlockFace;
var bkItemStack = Packages.org.bukkit.inventory.ItemStack;
var bkMaterial = Packages.org.bukkit.Material;
var bkLocation = Packages.org.bukkit.Location;
global.theDrone.up();
global.theDrone.chkpt('start');
var timeoutStop = new Date().getTime()+500;
  global.theDrone.box('98');
});