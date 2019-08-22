<?php
//~ fstat | fgrep -e internet -e USER (cool.. but no ip info)
require_once 'network.php';

class NetworkInfo extends Network {

	public function __construct() {
		echo json_encode(array(
			// 'http' => $this->getHttpConnections(),
			'socks' => $this->getConnectedSockets(),
			'socksl' => $this->getListeningSockets()
		));
	}

  private function getHttpConnections() {
		$www_total_count = 0;
		$results = Shell::exec('netstat -an | egrep \':80|:443\' | awk \'{print $5}\' | grep -v \':::\*\' |  grep -v \'0.0.0.0\'', $results);
		foreach ($results as $key => $value) {
			$array = explode(':', $value);
			$www_total_count++;
			if (preg_match('/^::/', $value)) {
				$ipaddr = $array[3];
			} else {
				$ipaddr = $array[0];
			}
			if (!in_array($ipaddr, $unique)) {
				$unique[] = $ipaddr;
				$www_unique_count++;
			}
		}
		unset($results);
		return count($unique);
	}
	
	private function getConnectedSockets() {
		$cmd = 'sockstat -4c | tail +2 | head -10';
		$output = explode(PHP_EOL, Shell::exec($cmd));
		$results = array();
		foreach ($output as $key => $value) {
			$value = preg_split('/\s+/', $value);
			$results[] = array(
				'User' => $value[0],
				'Command' => $value[1],
				'Proto' => $value[4],
				'Local' => $value[5],
				'Foreign' => $value[6]
			);
		}
		return $results;
	}

	private function getListeningSockets() {
		$cmd = 'sockstat -4l | tail +2 | head -10';
		$output = explode(PHP_EOL, Shell::exec($cmd));
		$results = array();
		foreach ($output as $key => $value) {
			$value = preg_split('/\s+/', $value);
			$results[] = array(
				'User' => $value[0],
				'Command' => $value[1],
				'Proto' => $value[4],
				'Local' => $value[5],
				'Foreign' => $value[6]
			);
		}
		return $results;
	}

}

$network_info = new NetworkInfo();

?>