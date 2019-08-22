<?php
//~ sysctl dev.ix | grep queue (good stuff here)
require_once 'network.php';

class NetworkBandwidth extends Network {

	private $network_bandwidth_total = 0;

	public function __construct() {
		echo json_encode(array(
			'data' => $this->getBandwidth(),
			'total' => $this->network_bandwidth_total
		));
	}

  // looping through the interfaces adds one second to rtt for each interface
  private function getBandwidth() {
    $result = array();
    foreach ($this->getInterfaceNames() as $key => $value) {
      $cmd = 'netstat -I ' . $value . ' -w 1 -q 1 -b4nW | tail -1';
      $output = preg_split('/\s+/', Shell::exec($cmd));
      $bytes_in = $output[3];
			$bytes_out = $output[6];
			$result[$value] = array(
				'bytes_in' => $bytes_in,
				'bytes_out' => $bytes_out,
				'total' => $bytes_in + $bytes_out
			);
		}
		foreach ($result as $key => $value) {
			$this->network_bandwidth_total += $value['total'];
		}
    return $result;
	}
	
//   public static function tx_rx_total() {
//     $tx_rx = array();
//     $tx = 'sysctl -n dev.ix.0.queue0.tx_packets';
//     $tx_rx[] = Shell::exec($tx);
//     $rx = 'sysctl -n dev.ix.0.queue0.rx_packets';
//     $tx_rx[] = Shell::exec($rx);
//     return $tx_rx;
//   }

}

$network_bandwidth = new NetworkBandwidth();

?>