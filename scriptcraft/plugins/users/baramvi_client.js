var global = this;
command( 'baramvi_run', function ( parameters, player ) {
  var playerLocation = player.getLocation();
  var delay_add=0;
  var theDrone = new Drone(player);
  global.theDrone = theDrone;
  global.theDrone.up();
  global.theDrone.chkpt('start');
});
command( 'baramvi_forward', function ( parameters, player ) {
  var bkLocation = org.bukkit.Location;
  var world = player.getWorld();
  var loc = player.getLocation();
  if(isNaN(Number(parameters[0]))){
    player.sendMessage('please input number.');
    return false;
  }
  var distance = parameters[0];
  var yaw  = ((loc.getYaw() + 90)  * Math.PI) / 180;
  var x = Math.cos(yaw);
  var z = Math.sin(yaw);
  player.teleport(new bkLocation(world, loc.getX()+x*distance,loc.getY(), loc.getZ()+z*distance, loc.getYaw(), loc.getPitch()));
});
