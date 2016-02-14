#include <pebble.h>
#include <stdio.h>
#include <string.h>

Window *window;	

TextLayer *text_left, *text_top, *text_right;
char left[] = "LEFT: X";
//Change left [6]
char right[] = "RIGHT: X";
//Change right [7]
char forward[] = "FORWARD: X";
//Change forward [9]
int count = 0;







/////////////////////////////
//
//  Their Stuff
//
//
// Key values for AppMessage Dictionary
enum {
	FORWARD_KEY = 0,	
	RIGHT_KEY = 1,
  LEFT_KEY = 2
};

// Write message to buffer & send
void send_message(void){
    APP_LOG(APP_LOG_LEVEL_DEBUG, "entered send_message"); 
	DictionaryIterator *iter;
	
	app_message_outbox_begin(&iter);
  if(iter==NULL)
       APP_LOG(APP_LOG_LEVEL_DEBUG, "iter==NULL");
  else
       APP_LOG(APP_LOG_LEVEL_DEBUG, "iter!=NULL"); 
  
  dict_write_uint8(iter, FORWARD_KEY, 0x1);
	//dict_write_cstring(iter, MESSAGE_KEY, "Hi Phone, I'm a Pebble!");
  
  dict_write_uint8(iter, RIGHT_KEY, 3);
	dict_write_end(iter);
  	app_message_outbox_send();
}

// Called when a message is received from PebbleKitJS
static void in_received_handler(DictionaryIterator *received, void *context) {
	Tuple *tuple;
  
        APP_LOG(APP_LOG_LEVEL_DEBUG, "success ");
  
  right[7] = 'a';
	tuple = dict_find(received, FORWARD_KEY);

		APP_LOG(APP_LOG_LEVEL_DEBUG, "Received Forward: %d", (int)tuple->value->uint32); 
	
	forward[7] = ((int)tuple->value->uint32)+48;
	tuple = dict_find(received, RIGHT_KEY);
		APP_LOG(APP_LOG_LEVEL_DEBUG, "Received Right: %d", (int)tuple->value->uint32); 
	
  right[7] = ((int)tuple->value->uint32)+48;
  tuple = dict_find(received, LEFT_KEY);

	  APP_LOG(APP_LOG_LEVEL_DEBUG, "Received Left: %d", (int)tuple->value->uint32); 
	
  left[7] = ((int)tuple->value->uint32)+48;
    text_layer_set_text(text_top, forward);
    text_layer_set_text(text_right, right);
    text_layer_set_text(text_left, left);

}

// Called when an incoming message from PebbleKitJS is dropped
static void in_dropped_handler(AppMessageResult reason, void *context) {	
  	right[7] = 'b';
      APP_LOG(APP_LOG_LEVEL_DEBUG, "in_dropped %i",reason);
    text_layer_set_text(text_right, right);
}

// Called when PebbleKitJS does not acknowledge receipt of a message
static void out_failed_handler(DictionaryIterator *failed, AppMessageResult reason, void *context) {
  	right[6] ++;
    text_layer_set_text(text_right, right);
    APP_LOG(APP_LOG_LEVEL_DEBUG, "out_failed_handler %i",reason);
    APP_LOG(APP_LOG_LEVEL_DEBUG, "going to send again");  
    send_message();
}

static void out_sent_handler(DictionaryIterator *sent, void *context){
        APP_LOG(APP_LOG_LEVEL_DEBUG, "out_sent_handler");
}


void down_single_click_handler(ClickRecognizerRef recognizer, void *context){
        APP_LOG(APP_LOG_LEVEL_DEBUG, "downclick");
  send_message();
}

void config_provider(Window *window) {
     window_single_click_subscribe(BUTTON_ID_DOWN, down_single_click_handler);
}

static void second_tick(struct tm *tick_time, TimeUnits units_changed)
{
  count++;
  if(count>=7)
  {
    count=0;
    send_message();
  }
}




/////////////////////////////
// 
//  INT and DEINT
//
////////////////////////////
void init(void) {
	window = window_create();
	window_stack_push(window, true);
  
  Layer *window_layer = window_get_root_layer(window);
  
 text_left = text_layer_create(GRect(5, 70, 144, 144));
 text_layer_set_font(text_left, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
 layer_add_child(window_layer, text_layer_get_layer(text_left));
 
 text_top = text_layer_create(GRect(0, 20, 144, 50));
 text_layer_set_font(text_top, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));
 text_layer_set_text_alignment(text_top, GTextAlignmentCenter);
 layer_add_child(window_layer, text_layer_get_layer(text_top));

 text_right = text_layer_create(GRect(80, 70, 144, 50));
 text_layer_set_font(text_right, fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD));

 layer_add_child(window_layer, text_layer_get_layer(text_right));

  text_layer_set_text(text_left, left);
  text_layer_set_text(text_top, forward);
  text_layer_set_text(text_right, right);
  
  
	// Register AppMessage handlers
	app_message_register_inbox_received(in_received_handler); 
	app_message_register_inbox_dropped(in_dropped_handler); 
	app_message_register_outbox_failed(out_failed_handler);
  app_message_register_outbox_sent(out_sent_handler);
		
	app_message_open(app_message_inbox_size_maximum(), app_message_outbox_size_maximum());
  
  tick_timer_service_subscribe(SECOND_UNIT, second_tick);
  window_set_click_config_provider(window, (ClickConfigProvider) config_provider);
  
  
    APP_LOG(APP_LOG_LEVEL_DEBUG, "going to send first time"); 
  
}


void deinit(void) {
	app_message_deregister_callbacks();
	window_destroy(window);
}

int main( void ) {
	init();
	app_event_loop();
	deinit();
}
