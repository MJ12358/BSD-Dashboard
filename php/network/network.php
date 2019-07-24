<?php
require_once '../functions.php';
// sysctl dev.ix | grep queue (good stuff here)

class Network {

	public function __construct() {

	}

	public function getInterfaceCount() {
    $cmd = 'ifconfig | grep flags | cut -d : -f1';
    return explode(PHP_EOL, Shell::exec($cmd));
  }

  public function getInterfaceName() {
    $cmd = 'sysctl -n dev.ix.0.%desc';
    $result = Shell::exec($cmd);
    return trim(explode('PCI', $result)[0]);
	}
	
//   public static $if_count;

//   public static function http_connections() {
//     if (function_exists('exec')) {
//       $www_total_count = 0;
//       @exec ('netstat -an | egrep \':80|:443\' | awk \'{print $5}\' | grep -v \':::\*\' |  grep -v \'0.0.0.0\'', $results);
//       foreach ($results as $key => $value) {
//         $array = explode(':', $value);
//         $www_total_count++;
//         if (preg_match('/^::/', $value)) {
//           $ipaddr = $array[3];
//         } else {
//           $ipaddr = $array[0];
//         }
//         if (!in_array($ipaddr, $unique)) {
//           $unique[] = $ipaddr;
//           $www_unique_count++;
//         }
//       }
//       unset($results);
//       return count($unique);
//     }
//   }

//   public static function temperature() {
//     $cmd = 'sysctl -n dev.ix.0.phy.temp';
//     return Shell::exec($cmd);
//   }


//   public static function tx_rx_total() {
//     $tx_rx = array();
//     $tx = 'sysctl -n dev.ix.0.queue0.tx_packets';
//     $tx_rx[] = Shell::exec($tx);
//     $rx = 'sysctl -n dev.ix.0.queue0.rx_packets';
//     $tx_rx[] = Shell::exec($rx);
//     return $tx_rx;
//   }

}

?>