#include <pebble.h>

static Window *window;
static ScrollLayer *scroll_layer;
static TextLayer *text_layer = NULL;
static StatusBarLayer *s_status_bar;
static int ScrollByAmount;
/*
 * Smaller = 18
 * Default = 24_BOLD
 * Larger = 28
 */
static int FontSize = 24;
static GFont font;
static char s_scroll_text[] = "Please set your note in the settings";

#define NoteMaxLength 2048
const uint32_t inbox_size = NoteMaxLength;
const uint32_t outbox_size = 16;

typedef enum {
    NoScrolling,
    ScrollDirectionDown,
    ScrollDirectionUp,
} ScrollDirection;

static ScrollDirection ContinousScroll = NoScrolling;

typedef enum {
    AppKeyNoteLength = 0,
    AppKeyNote = 1,
    AppKeyFontSize = 2
} AppKeys;
static char *s_buffer = NULL;

static GFont get_font_for_size(int font_size) {
    GFont font;
    switch (font_size) {
        case 9:
            font = fonts_get_system_font(FONT_KEY_GOTHIC_09);
            break;
        case 14:
            font = fonts_get_system_font(FONT_KEY_GOTHIC_14);
            break;
        case 18:
            font = fonts_get_system_font(FONT_KEY_GOTHIC_18);
            break;
        case 24:
            font = fonts_get_system_font(FONT_KEY_GOTHIC_24_BOLD);
            break;
        case 28:
            font = fonts_get_system_font(FONT_KEY_GOTHIC_28);
            break;
        default:
            font = fonts_get_system_font(FONT_KEY_GOTHIC_14);
    }
    return font;
}

static GPoint get_scroll_amount(ScrollDirection direction) {
    int delta = direction == ScrollDirectionDown ? -1 : +1;
    GPoint scroll_amount = GPoint(0, delta * ScrollByAmount);
    return scroll_amount;
}

static void scroll(GPoint amount) {
    GPoint current_offset = scroll_layer_get_content_offset(scroll_layer);
    GPoint new_offset = GPoint(0, current_offset.y + amount.y);
    scroll_layer_set_content_offset(scroll_layer, new_offset, true);
}
static void select_click_handler(ClickRecognizerRef recognizer, void *context) {
    text_layer_set_text(text_layer, "Select");
}

static void continous_scroll_callback(void *context) {
    if (ContinousScroll != NoScrolling) {
        scroll(get_scroll_amount(ContinousScroll));
        app_timer_register(100, continous_scroll_callback, NULL);
    }
}

static void up_click_handler(ClickRecognizerRef recognizer, void *context) {
    scroll(get_scroll_amount(ScrollDirectionUp));
}

static void up_long_press_handler(ClickRecognizerRef recognizer,
                                  void *context) {
    ContinousScroll = ScrollDirectionUp;
    scroll(get_scroll_amount(ContinousScroll));
    app_timer_register(100, continous_scroll_callback, NULL);
}

static void up_long_release_handler(ClickRecognizerRef recognizer,
                                    void *context) {
    ContinousScroll = NoScrolling;
}

static void down_click_handler(ClickRecognizerRef recognizer, void *context) {
    scroll(get_scroll_amount(ScrollDirectionDown));
}

static void down_long_press_handler(ClickRecognizerRef recognizer,
                                    void *context) {
    //APP_LOG(APP_LOG_LEVEL_DEBUG, "Pressed");
    ContinousScroll = ScrollDirectionDown;
    scroll(get_scroll_amount(ContinousScroll));
    app_timer_register(100, continous_scroll_callback, NULL);
}

static void down_long_release_handler(ClickRecognizerRef recognizer,
                                      void *context) {
    ContinousScroll = NoScrolling;
    //APP_LOG(APP_LOG_LEVEL_DEBUG, "Released");
}

static void click_config_provider(void *context) {
    window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
    window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
    window_single_click_subscribe(BUTTON_ID_UP, up_click_handler);
    window_single_click_subscribe(BUTTON_ID_DOWN, down_click_handler);
    window_long_click_subscribe(BUTTON_ID_DOWN, 0, down_long_press_handler,
                                down_long_release_handler);
    window_long_click_subscribe(BUTTON_ID_UP, 0, up_long_press_handler,
                                up_long_release_handler);
}

static void refresh_text_layer(char *buffer, int32_t font_size) {
    Layer *window_layer = window_get_root_layer(window);
    GRect frame = layer_get_frame(window_layer);
    GRect max_text_bounds = GRect(0, STATUS_BAR_LAYER_HEIGHT, frame.size.w, 2000);
    if(text_layer != NULL){
        text_layer_destroy(text_layer);
    }
    text_layer = text_layer_create(max_text_bounds);
    scroll_layer_add_child(scroll_layer, text_layer_get_layer(text_layer));
    layer_add_child(window_layer, scroll_layer_get_layer(scroll_layer));

    s_status_bar = status_bar_layer_create();
    layer_add_child(window_layer, status_bar_layer_get_layer(s_status_bar));

    ScrollByAmount = 2 * font_size;
    font = get_font_for_size(font_size);
    //APP_LOG(APP_LOG_LEVEL_DEBUG, "font: %li", font_size);
    text_layer_set_text(text_layer, buffer);
    text_layer_set_font(text_layer, font);
    text_layer_set_text_alignment(text_layer, GTextAlignmentLeft);
    //APP_LOG(APP_LOG_LEVEL_DEBUG, "length: %u", strlen(buffer));
    GSize max_size = text_layer_get_content_size(text_layer);
    max_size.h += font_size/2 + STATUS_BAR_LAYER_HEIGHT;
    //APP_LOG(APP_LOG_LEVEL_DEBUG, "width: %i, height: %i", max_size.w, max_size.h);
    text_layer_set_size(text_layer, max_size);
    scroll_layer_set_frame(scroll_layer, frame);
    scroll_layer_set_content_size(scroll_layer,
                                  GSize(frame.size.w, max_size.h + 4));
}

static void inbox_received_callback(DictionaryIterator *iter, void *context) {
    //APP_LOG(APP_LOG_LEVEL_DEBUG, "trying to receive");
    Tuple *font_size_tuple = dict_find(iter, AppKeyFontSize);
    int32_t font_size = FontSize;
    if (font_size_tuple) {
        font_size = font_size_tuple->value->int32;
    }
    Tuple *note_length_tuple = dict_find(iter, AppKeyNoteLength);
    int32_t note_length = NoteMaxLength;
    if (note_length_tuple) {
        note_length = note_length_tuple->value->int32;
    } else {
        //APP_LOG(APP_LOG_LEVEL_DEBUG, "didn't receive note length");
    }
    Tuple *note_tuple = dict_find(iter, AppKeyNote);
    if (note_tuple) {
        if (s_buffer != NULL) {
            free(s_buffer);
            s_buffer = NULL;
        }
        s_buffer = calloc((size_t)note_length, sizeof(char));
        char *note = note_tuple->value->cstring;
        snprintf(s_buffer, note_length, "%s", note);
    }
    refresh_text_layer(s_buffer, font_size);
}

static void window_load(Window *window) {
    Layer *window_layer = window_get_root_layer(window);
    GRect frame = layer_get_frame(window_layer);
    ScrollByAmount = 2 * FontSize;

    scroll_layer = scroll_layer_create(frame);

//refresh_text_layer(s_scroll_text, FontSize);
}

static void window_unload(Window *window) {
    text_layer_destroy(text_layer);
    scroll_layer_destroy(scroll_layer);
    status_bar_layer_destroy(s_status_bar);
}

static void init(void) {
    window = window_create();
    window_set_click_config_provider(window, click_config_provider);
    window_set_window_handlers(window,
                               (WindowHandlers){
                                   .load = window_load, .unload = window_unload,
                               });
    app_message_open(inbox_size, outbox_size);
    app_message_register_inbox_received(inbox_received_callback);
    const bool animated = true;
    window_stack_push(window, animated);
}

static void deinit(void) {
    window_destroy(window);
    if (s_buffer != NULL) {
        free(s_buffer);

        s_buffer = NULL;
    }
}

int main(void) {
    init();

    //APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", window);

    app_event_loop();
    deinit();
}
